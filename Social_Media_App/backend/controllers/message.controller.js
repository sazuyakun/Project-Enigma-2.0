import { Conversation } from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { Message } from "../models/message.model.js";
import { encryptText, decryptText } from "../utils/encryption.js";
import axios from "axios"

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;
    async function analyzeText(message) {
      try {
        const textAnalyzerResponse = await axios.post("http://127.0.0.1:8080/classify/text-predict", {
          user: message
        })
        console.log(textAnalyzerResponse.data); // Log the actual response data
      } catch (error) {
        console.error("Error:", error); // Handle errors
      }
    }
    analyzeText(message)
    /*\
    {
      classification: [
        {
          classification: 'negative',
          decoded_terms: {
            "term":"denomination",
          },
          identified_slang: []
        }
      ]
    }
    */

    // Encrypt the message before saving
    const encryptedMessage = encryptText(message);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: encryptedMessage, // Save encrypted message
    });

    if (newMessage) conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    // Decrypt message before sending through socket
    const decryptedMessage = {
      ...newMessage.toObject(),
      message: decryptText(newMessage.message),
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", decryptedMessage);
    }

    return res.status(201).json({
      success: true,
      newMessage: decryptedMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation)
      return res.status(200).json({ success: true, messages: [] });

    // Decrypt all messages before sending
    const decryptedMessages = conversation.messages.map((msg) => ({
      ...msg.toObject(),
      message: decryptText(msg.message),
    }));

    return res.status(200).json({
      success: true,
      messages: decryptedMessages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};