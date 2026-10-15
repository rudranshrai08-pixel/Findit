import Icon from "./Icon.jsx";

export default function ListingCard({ item, isSaved, onSave, onOpen }) {
  return (
    <article className="listing-card">
      <button
        className={`save-button${isSaved ? " saved" : ""}`}
        onClick={() => onSave(item.id)}
        aria-label={isSaved ? "Remove saved item" : "Save item"}
      >
        <Icon name="heart" size={18} />
      </button>
      <button
        className={`item-art ${item.color}`}
        onClick={() => onOpen(item)}
        aria-label={`View ${item.title}`}
      >
        {item.photo ? (
          <img className="item-photo" src={item.photo} alt={item.title} />
        ) : (
          <span className="item-emoji">{item.emoji}</span>
        )}
        <span className={`type-pill ${item.type.toLowerCase()}`}>
          {item.type === "Lost" ? "Looking for" : "Found"}
        </span>
      </button>
      <div className="card-content">
        <div className="card-meta">
          <span>{item.category}</span>
          <span className="meta-dot" />
          <span>
            <Icon name="clock" size={13} /> {item.age}
          </span>
        </div>
        <button className="card-title" onClick={() => onOpen(item)}>
          {item.title}
        </button>
        <div className="card-location">
          <Icon name="pin" size={15} />
          <span>{item.place}</span>
        </div>
        <div className="card-footer">
          <span className="reporter">
            <span className="reporter-avatar">{item.initials}</span> Community
            member
          </span>
          <button
            className="card-arrow"
            onClick={() => onOpen(item)}
            aria-label={`Details for ${item.title}`}
          >
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
