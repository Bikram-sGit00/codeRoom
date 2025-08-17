import { useParams } from "react-router-dom";

function RoomPage() {
  const { roomId } = useParams(); // e.g. "Math" or "English"

  return (
    <div className="room-page">
      <h1>Welcome to {roomId} Room 📚</h1>
      <div className="chat-section">
        {/* Later we’ll fetch messages from backend */}
        <p>will work on chat</p>
      </div>
    </div>
  );
}

export default RoomPage;
