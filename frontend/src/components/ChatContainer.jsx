{messages.map((message) => {
  const isOwn = String(message.senderId) === String(authUser?.id);

  return (
    <div key={message.id} className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
      <div className="chat-bubble">
        {message.image && <img src={message.image} alt="message attachment" />}
        {message.text && <p>{message.text}</p>}
      </div>
    </div>
  );
})}
