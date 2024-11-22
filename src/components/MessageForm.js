import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const MessageForm = ({ text, setText, handleSubmit }) => {
  return (
    <form
      className="p-4 border-t border-gray-200 bg-white"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={!text.trim()}
        >
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
