import assert from 'assert';
import jsondiff from 'json0-ot-diff';
import diffMatchPatch from 'diff-match-patch';
import { timestamp, Commit, Edge, testData } from 'vizhub-entities';
import { CreateCommit, CreateEdge, GetVizAtCommit } from '../src/index';

// A utility function for generating ops by diffing objects.
const computeEdgeOps = (a, b) => jsondiff(a, b, diffMatchPatch);

const commits = {};
const edges = {};
const edgesByTarget = {}; // Keys: target commit id
const revisionHistoryGateway = {
  createCommit: async ({ id, viz, timestamp }) => {
    const commit = new Commit({ id, viz, timestamp });
    commits[id] = commit;
    return commit;
  },
  createEdge: async ({ source, target, ops }) => {
    const edge = new Edge({ source, target, ops });
    const id = source + '|' + target;
    edges[id] = edge;

    if (edgesByTarget[target]) {
      edgesByTarget[target].push(edge);
    } else {
      edgesByTarget[target] = [edge];
    }

    return edge;
  },
  getEdgesByTarget: async (target) => edgesByTarget[target] || [],
};

describe('Revision History Use Cases', () => {
  const createCommit = new CreateCommit({ revisionHistoryGateway });
  const createEdge = new CreateEdge({ revisionHistoryGateway });
  const getVizAtCommit = new GetVizAtCommit({ revisionHistoryGateway });

  describe('Create Commit', () => {
    it('should return an id if success.', async () => {
      const id = 'commit-1';
      const viz = 'viz-a';
      const timestamp = 1606341594.852;
      const commit = await createCommit.execute({ id, viz, timestamp });
      assert.equal(commit.id, id);
    });
  });
  describe('Create Edge', () => {
    it('should return an id if success.', async () => {
      // This is the case where a viz is forked - no ops, different viz IDs.
      const source = await createCommit.execute({ id: '1', viz: 'a' }).id;
      const target = await createCommit.execute({ id: '2', viz: 'b' }).id;
      const ops = [];
      const edge = await createEdge.execute({ source, target, ops });
      assert.equal(edge.source, source);
      assert.equal(edge.target, target);
      assert.equal(edge.ops, ops);
    });
  });
  describe('Get Viz At Commit', () => {
    const expectedVizV1 = JSON.parse(JSON.stringify(testData.visualization));

    const expectedVizV2 = JSON.parse(JSON.stringify(testData.visualization));
    expectedVizV2.info.title = 'Bar';

    console.log(expectedVizV2);
    it('should apply ops from root.', async () => {
      await createCommit.execute({ id: '0' });
      await createCommit.execute({ id: '1' });
      const ops = computeEdgeOps({}, expectedVizV1);
      await createEdge.execute({ source: '0', target: '1', ops });
      const actualVizV1 = await getVizAtCommit.execute({ commit: '1' });
      assert.deepEqual(actualVizV1, expectedVizV1);
    });

    it('should apply ops combined from 2 edges.', async () => {
      await createCommit.execute({ id: '2' });
      const ops = computeEdgeOps(expectedVizV1, expectedVizV2);
      await createEdge.execute({ source: '1', target: '2', ops });
      const actualVizV2 = await getVizAtCommit.execute({ commit: '2' });
      assert.deepEqual(actualVizV2, expectedVizV2);
    });
  });
});
