import { useState } from "react";
import Icon from "./Icon.jsx";
import { categories } from "../data/listings.js";

export default function ReportModal({ onClose, onSubmit }) {
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Choose a photo smaller than 5 MB.");
      return;
    }
    // Read the selected photo so the student can see it before posting.
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.onerror = () =>
      setPhotoError("This photo could not be opened. Try another one.");
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    onSubmit({
      id: Date.now(),
      type: fields.type.value,
      title: fields.title.value,
      category: fields.category.value,
      place: fields.place.value,
      age: "Just now",
      date: "Just now",
      emoji: fields.emoji.value || "📦",
      color: "blue",
      details: fields.details.value,
      initials: "YOU",
      photo,
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-heading"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
        <div className="modal-kicker">Help it find its way</div>
        <h2 id="report-heading">Report an item</h2>
        <p className="modal-intro">
          Add a clear description and a photo to help identify it.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Report type
            <select name="type">
              <option>Lost</option>
              <option>Found</option>
            </select>
          </label>
          <label>
            Item name
            <input
              name="title"
              required
              maxLength="80"
              placeholder="e.g. Blue backpack"
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <select name="category">
                {categories.slice(1).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Emoji (optional)
              <input name="emoji" placeholder="🎒" maxLength="4" />
            </label>
          </div>
          <label>
            Where was it lost or found?
            <input
              name="place"
              required
              maxLength="120"
              placeholder="Building, room, or nearby landmark"
            />
          </label>
          <label>
            Details
            <textarea
              name="details"
              required
              rows="3"
              maxLength="500"
              placeholder="Color, distinguishing details, and when you last saw it"
            />
          </label>
          <div className="photo-picker">
            {photo ? (
              <div className="photo-preview">
                <img src={photo} alt="Selected item" />
                <button type="button" onClick={() => setPhoto("")}>
                  Remove photo
                </button>
              </div>
            ) : (
              <label className="photo-drop" htmlFor="item-photo">
                <Icon name="camera" size={22} />
                <span>
                  <b>Add an item photo</b>
                  <small>
                    Choose a photo or take one with your camera · up to 5 MB
                  </small>
                </span>
                <input
                  id="item-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
            {photoError && (
              <span className="photo-error" role="alert">
                {photoError}
              </span>
            )}
          </div>
          <button className="button button-primary submit-button" type="submit">
            Add listing <Icon name="arrow" size={17} />
          </button>
        </form>
      </section>
    </div>
  );
}
