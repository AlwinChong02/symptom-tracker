import { getUserIdFromRequest } from './auth';
import User from '../models/User';
import dbConnect from './dbConnect';

// Check if user is admin
export async function isUserAdmin(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    
    if (!userId) {
      return false;
    }

    const user = await User.findById(userId).select('role');
    return user?.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// Middleware to require admin access
export async function requireAdmin(req) {
  const isAdmin = await isUserAdmin(req);
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return true;
}

// Get admin user details
export async function getAdminUser(req) {
  try {
    await dbConnect();
    const userId = await getUserIdFromRequest(req);
    
    if (!userId) {
      return null;
    }

    const user = await User.findById(userId).select('name email role');
    return user?.role === 'admin' ? user : null;
  } catch (error) {
    console.error('Get admin user error:', error);
    return null;
  }
}
