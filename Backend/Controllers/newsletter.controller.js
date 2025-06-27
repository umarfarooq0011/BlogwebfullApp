import { Newsletter } from '../Models/newsletter.model.js';
import { sendSubscriptionEmail } from '../Mails/emails.js';
import mongoose from 'mongoose';

// Controller to handle newsletter subscription
export const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  try {
    // Check if the email is already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed.',
      });
    }

    // Create a new subscriber
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    // Send a confirmation email (optional but good practice)
    await sendSubscriptionEmail(email);

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while subscribing. Please try again.',
      error: error.message,
    });
  }
};

// Admin: Get all newsletter subscribers
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      subscribers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscribers.',
      error: error.message,
    });
  }
};

// Admin: Delete a newsletter subscriber
export const deleteSubscriber = async (req, res) => {
  const { id } = req.params;

  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subscriber ID format.',
    });
  }

  try {
    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting subscriber.',
      error: error.message,
    });
  }
}; 