import React, { useState, useRef, useEffect } from "react";

const SearchBar = ({
  onSearch,
  placeholder = "Search...",
  suggestions = [],
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, suggestions]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }} ref={searchRef}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "25px",
          padding: "12px 20px",
          transition: "all 0.3s ease",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            color: "var(--text-muted)",
            marginRight: "12px",
            fontSize: "20px",
          }}
        >
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text)",
            fontSize: "14px",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            marginTop: "4px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            zIndex: 100,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSearch(suggestion)}
              style={{
                padding: "12px 20px",
                cursor: "pointer",
                borderBottom:
                  index < filteredSuggestions.length - 1
                    ? "1px solid var(--border-color)"
                    : "none",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "var(--hover-bg)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              <span style={{ color: "var(--text)", fontSize: "14px" }}>
                {suggestion}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
