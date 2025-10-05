
import React from "react";
import { useParams } from "react-router";

const ResumeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // You can fetch resume details using the id here
  // For now, just display the id
  return (
    <div style={{ padding: 24 }}>
      <h2>Resume Details</h2>
      <p>Resume ID: {id}</p>
      {/* Add more details here as needed */}
    </div>
  );
};

export default ResumeDetail;
