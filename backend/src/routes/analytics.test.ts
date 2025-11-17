process.env.MONGODB_URI = 'mongodb://dummy-uri-for-testing';
import { verifyLinkOwnership } from './analytics'; // Import the function to test
import { connectDB } from '../db'; // Import the dependency to mock

// Mock the entire db module
jest.mock('../db');

// Type-cast the mock
const mockConnectDB = connectDB as jest.Mock;

describe('verifyLinkOwnership', () => {

    // Create a mock for what db.collection.findOne will return
    const mockFindOne = jest.fn();

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Set up the mock database chain
        // connectDB -> db -> collection -> findOne
        mockConnectDB.mockResolvedValue({
            collection: () => ({
                findOne: mockFindOne,
            }),
        });
    });

    it('should return the doc if found and not deleted', async () => {
        const mockDoc = { _id: 'abc', uid: 'user1', deleted: false, name: 'Test' };
        mockFindOne.mockResolvedValue(mockDoc); // Set findOne's return value

        const result = await verifyLinkOwnership('abc', 'user1');

        // Check that findOne was called with the correct query
        expect(mockFindOne).toHaveBeenCalledWith(
            { _id: 'abc', uid: 'user1' },
            { projection: { _id: 1, uid: 1, name: 1, target: 1, deleted: 1 } }
        );
        // Check that the function returned the correct document
        expect(result).toEqual(mockDoc);
    });

    it('should return null if the doc is not found', async () => {
        mockFindOne.mockResolvedValue(null); // Simulate not finding the doc

        const result = await verifyLinkOwnership('abc', 'user1');

        expect(result).toBeNull();
    });

    it('should return null if the doc is marked as deleted', async () => {
        const mockDoc = { _id: 'abc', uid: 'user1', deleted: true, name: 'Test' };
        mockFindOne.mockResolvedValue(mockDoc); // Simulate finding a deleted doc

        const result = await verifyLinkOwnership('abc', 'user1');

        expect(result).toBeNull();
    });
});