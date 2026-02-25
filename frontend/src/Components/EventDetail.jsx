import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Api/Axios";

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short', // Adds day of week (e.g., "Thu")
    month: 'long',    // Full month name (e.g., "June")
    day: 'numeric',   // Day of month (e.g., "12")
    hour: '2-digit',  // 2-digit hour (e.g., "06")
    minute: '2-digit',// 2-digit minute (e.g., "06")
    hour12: true      // 12-hour format with AM/PM
  });
};
const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Axios.get(`/events/${id}`)
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow">
      <h2 className="text-3xl font-bold mb-4">{event.title}</h2>
      {event.image && <img src={event.image} alt={event.title} className="mb-4 rounded" />}
      <p className="mb-2">{event.description}</p>
      <div className="mb-2">
        <span className="font-medium">Start:</span> {event.startDate ? formatDateTime(event.startDate) : "N/A"}
      </div>
      <div className="mb-2">
        <span className="font-medium">End:</span> {event.endDate ?formatDateTime(event.startDate): "N/A"}
      </div>
      <div>
        <span className="font-medium">Assigned To:</span> {event.assignedTo?.username || "N/A"}
      </div>
    </div>
  );
};

export default EventDetail;