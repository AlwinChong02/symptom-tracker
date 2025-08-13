// This is a placeholder for a real authentication utility.
// In a production app, this function would validate a session token
// and return the user's ID from the database.

import User from '../models/User'; // Assuming a User model exists

// Mock function to simulate getting a user ID from a request.
// It finds the first user and assumes they are the logged-in user.
export async function getUserIdFromRequest(req) {
  try {
    // For demonstration, we'll just find the first user in the database.
    // IMPORTANT: This is NOT secure and should be replaced with a proper
    // token or session validation system (e.g., NextAuth.js, JWT).
    const user = await User.findOne().select('_id');
    if (!user) {
      throw new Error('No users found in the database. Please register a user first.');
    }
    return user._id;
  } catch (error) { 
    console.error('Authentication error:', error.message);
    throw new Error('Authentication failed.');
  }
}
