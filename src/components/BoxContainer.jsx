import React from "react";

export default function BoxContainer({ index }) {
  return (
    <div className="box">
      <p>Box #{index + 1}</p>
    </div>
  );
}
