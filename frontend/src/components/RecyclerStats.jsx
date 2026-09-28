function RecyclerStats({ handovers }) {

  const pendingRequests =
    handovers.filter(
      (handover) =>
        handover.status === "Pending"
    ).length;

  const confirmedRequests =
    handovers.filter(
      (handover) =>
        handover.status === "Confirmed"
    ).length;

  const completedRequests =
    handovers.filter(
      (handover) =>
        handover.status === "Completed"
    ).length;

  const totalPayments =
    handovers
      .filter(
        (handover) =>
          handover.payment_status === "Paid"
      )
      .reduce(
        (total, handover) =>
          total +
          Number(
            handover.estimated_value || 0
          ),
        0
      );

  const cardStyle = {
    flex: "1",
    minWidth: "180px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "25px",
      }}
    >

      {/* Pending */}

      <div style={cardStyle}>
        <h3>Pending Requests</h3>

        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {pendingRequests}
        </p>
      </div>


      {/* Confirmed */}

      <div style={cardStyle}>
        <h3>Confirmed</h3>

        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {confirmedRequests}
        </p>
      </div>


      {/* Completed */}

      <div style={cardStyle}>
        <h3>Completed</h3>

        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {completedRequests}
        </p>
      </div>


      {/* Payments */}

      <div style={cardStyle}>
        <h3>Total Payments</h3>

        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          ₹{totalPayments.toFixed(2)}
        </p>
      </div>

    </div>
  );
}

export default RecyclerStats;