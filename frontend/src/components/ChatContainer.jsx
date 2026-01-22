{messages.map((message) => {
  const isOwn = String(message.senderId) === String(authUser?.id);

  return (
    <div key={message.id} className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
      <div className="chat-bubble flex flex-col">

        {message.image && (
          <img 
            src={message.image} 
            alt="message attachment" 
            className="rounded-md mb-2 max-w-[200px]" 
          />
        )}

        {message.text && <p>{message.text}</p>}

      </div>
    </div>
  );
})}

export default ChatContainer;
