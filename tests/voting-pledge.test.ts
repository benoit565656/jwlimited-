import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/lib/db';

describe('Manila Wine Collector Choice Voting & Pledge Logic', () => {
  const db = getDb();
  const campaign = db.getCampaignBySlug();

  beforeEach(() => {
    // Ensure campaign is in voting_open state for voting tests
    db.updateCampaign(campaign.id, {
      status: 'voting_open',
      vote_opens_at: new Date(Date.now() - 3600000).toISOString(),
      vote_closes_at: new Date(Date.now() + 86400000).toISOString(),
    });
  });

  it('1. Enforces exactly one vote per user per campaign', () => {
    const userId = `test-user-${Date.now()}`;
    const designs = db.getDesigns(campaign.id);
    const designA = designs[0].id;

    // First vote
    const result1 = db.castOrChangeVote(campaign.id, userId, designA);
    expect(result1.isChange).toBe(false);
    expect(result1.vote.design_id).toBe(designA);

    // Repeated identical vote is idempotent
    const result2 = db.castOrChangeVote(campaign.id, userId, designA);
    expect(result2.isChange).toBe(false);
    expect(result2.vote.id).toBe(result1.vote.id);

    // Verify exactly one vote exists for user
    const userVote = db.getUserVote(campaign.id, userId);
    expect(userVote).toBeDefined();
    expect(userVote?.design_id).toBe(designA);
  });

  it('2. Moving a vote updates existing vote without creating duplicate ballots', () => {
    const userId = `test-user-change-${Date.now()}`;
    const designs = db.getDesigns(campaign.id);
    const designA = designs[0].id;
    const designB = designs[1].id;

    // Vote for design A
    const firstVote = db.castOrChangeVote(campaign.id, userId, designA);
    expect(firstVote.vote.design_id).toBe(designA);

    const countsBefore = db.getVoteCounts(campaign.id);
    const countABefore = countsBefore[designA] || 0;
    const countBBefore = countsBefore[designB] || 0;

    // Move vote to design B
    const movedVote = db.castOrChangeVote(campaign.id, userId, designB);
    expect(movedVote.isChange).toBe(true);
    expect(movedVote.vote.id).toBe(firstVote.vote.id); // Same vote record updated
    expect(movedVote.vote.design_id).toBe(designB);

    const countsAfter = db.getVoteCounts(campaign.id);
    expect(countsAfter[designA] || 0).toBe(countABefore - 1);
    expect(countsAfter[designB] || 0).toBe(countBBefore + 1);
  });

  it('3. Prevents voting when campaign status is not voting_open', () => {
    db.updateCampaign(campaign.id, { status: 'draft' });
    const userId = `test-user-blocked-${Date.now()}`;
    const designs = db.getDesigns(campaign.id);

    expect(() => {
      db.castOrChangeVote(campaign.id, userId, designs[0].id);
    }).toThrow(/Voting is not active/);
  });

  it('4. Prevents voting when deadline has passed', () => {
    db.updateCampaign(campaign.id, {
      status: 'voting_open',
      vote_closes_at: new Date(Date.now() - 60000).toISOString(), // 1 minute in past
    });
    const userId = `test-user-past-deadline-${Date.now()}`;
    const designs = db.getDesigns(campaign.id);

    expect(() => {
      db.castOrChangeVote(campaign.id, userId, designs[0].id);
    }).toThrow(/deadline has passed/);
  });

  it('5. Pledges are separate from votes and can be withdrawn without deleting vote', () => {
    const userId = `test-user-pledge-${Date.now()}`;
    const designs = db.getDesigns(campaign.id);
    const designId = designs[2].id;

    // Cast vote
    db.castOrChangeVote(campaign.id, userId, designId);

    // Register pledge
    const pledge = db.createOrUpdatePledge(campaign.id, userId, {
      preferred_number: 88,
      interest_tier: 'premium_collector',
      marketing_consent: true,
    });
    expect(pledge.status).toBe('active');
    expect(pledge.preferred_number).toBe(88);
    expect(pledge.design_id).toBe(designId);

    // Withdraw pledge
    const withdrawn = db.withdrawPledge(campaign.id, userId);
    expect(withdrawn.status).toBe('withdrawn');

    // Vote must remain active and unaffected
    const voteStillActive = db.getUserVote(campaign.id, userId);
    expect(voteStillActive).toBeDefined();
    expect(voteStillActive?.design_id).toBe(designId);
  });

  it('6. Preferred bottle number must be bounded between 1 and 100', () => {
    const userId = `test-user-bounds-${Date.now()}`;

    expect(() => {
      db.createOrUpdatePledge(campaign.id, userId, {
        preferred_number: 0,
        interest_tier: 'specific_standard',
      });
    }).toThrow(/between 1 and 100/);

    expect(() => {
      db.createOrUpdatePledge(campaign.id, userId, {
        preferred_number: 101,
        interest_tier: 'specific_standard',
      });
    }).toThrow(/between 1 and 100/);
  });

  it('7. CSV Exports generate formatted data for Manila Wine CRM', () => {
    const votesCsv = db.getVotesExport(campaign.id);
    expect(Array.isArray(votesCsv)).toBe(true);

    const pledgesCsv = db.getPledgesExport(campaign.id);
    expect(Array.isArray(pledgesCsv)).toBe(true);
  });
});
