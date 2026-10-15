import Icon from "./Icon.jsx";

export default function ItemDetailModal({ item, onClose, onContact }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-heading"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
        <div className={`detail-art ${item.color}`}>
          {item.photo ? (
            <img className="detail-photo" src={item.photo} alt={item.title} />
          ) : (
            <span>{item.emoji}</span>
          )}
          <span className={`type-pill ${item.type.toLowerCase()}`}>
            {item.type === "Lost" ? "Looking for" : "Found"}
          </span>
        </div>
        <div className="detail-content">
          <div className="card-meta">
            <span>{item.category}</span>
            <span className="meta-dot" />
            <span>{item.date}</span>
          </div>
          <h2 id="detail-heading">{item.title}</h2>
          <p>{item.details}</p>
          <div className="detail-place">
            <Icon name="pin" size={17} />
            {item.place}
          </div>
          <button
            className="button button-primary submit-button"
            onClick={onContact}
          >
            Contact poster <Icon name="arrow" size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
