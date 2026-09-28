function RoleSelector({
  role,
  setRole,
}) {
  return (
    <div
      style={{
        marginBottom: "25px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h3>Select User Role</h3>

      <button
        type="button"
        onClick={() =>
          setRole("collector")
        }
        style={{
          marginRight: "10px",
          padding: "10px 20px",
          backgroundColor:
            role === "collector"
              ? "#4caf50"
              : "#eee",
          color:
            role === "collector"
              ? "white"
              : "black",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Collector
      </button>

      <button
        type="button"
        onClick={() =>
          setRole("recycler")
        }
        style={{
          padding: "10px 20px",
          backgroundColor:
            role === "recycler"
              ? "#1976d2"
              : "#eee",
          color:
            role === "recycler"
              ? "white"
              : "black",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Recycler
      </button>
    </div>
  );
}

export default RoleSelector;