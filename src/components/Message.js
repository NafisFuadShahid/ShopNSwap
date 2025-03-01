import React from 'react';
import Moment from 'react-moment';
import { FaCheck, FaCheckDouble } from 'react-icons/fa';

const Message = ({ msg, user1, lastSeen }) => {
  const isMyMessage = msg.sender === user1;
  const isSeen = lastSeen && msg.createdAt && lastSeen.toDate() >= msg.createdAt.toDate();

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] break-words p-3 rounded-lg ${
          isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p>{msg.text}</p>
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs opacity-75">
            <Moment fromNow>{msg.createdAt?.toDate()}</Moment>
          </span>
          {isMyMessage && (
            <span className="ml-1">
              {isSeen ? (
                <FaCheckDouble className="text-green-400" />
              ) : (
                <FaCheck className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;