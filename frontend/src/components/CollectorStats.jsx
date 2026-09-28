function CollectorStats({
  lots,
  handovers,
  recyclers,
}) {
  const totalLots = lots.length;

  const totalEarnings = handovers
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

  const pendingHandovers =
    handovers.filter(
      (handover) =>
        handover.status === "Pending"
    ).length;

  const availableRecyclers =
    recyclers.length;

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
      <div style={cardStyle}>
        <h3>Total Lots</h3>
        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {totalLots}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Total Earnings</h3>
        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          ₹{totalEarnings.toFixed(2)}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Pending Handovers</h3>
        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {pendingHandovers}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Matched Recyclers</h3>
        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          {availableRecyclers}
        </p>
      </div>
    </div>
  );
}

export default CollectorStats;