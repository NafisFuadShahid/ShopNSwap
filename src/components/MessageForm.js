import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const MessageForm = ({ handleSubmit, text, setText, isTyping }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleEmojiSelect = (emoji) => {
    setText((prevText) => prevText + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleAttachment = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file.name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleAttachment}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaPaperclip className="w-5 h-5" />
      </button>
      <input
        type="text"
        placeholder="Type a message"
        value={text}
        onChange={handleChange}
        className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <FaSmile className="w-5 h-5" />
      </button>
      <button
        type="submit"
        className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!text.trim()}
      >
        <FaPaperPlane className="w-5 h-5" />
      </button>
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </form>
  );
};

export default MessageForm;