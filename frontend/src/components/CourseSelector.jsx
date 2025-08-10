import React from 'react';
import './CourseSelector.css';

export default function CourseSelector({
  courseData,
  selectedCourse,
  onCourseChange
}) {
  return (
    <div className="course-selector">
      <label className="cs-label" htmlFor="course-input">코스</label>
      <input
        id="course-input"
        list="course-list"
        className="cs-input"
        placeholder="코스명을 입력 또는 검색"
        value={selectedCourse}
        onChange={e => onCourseChange(e.target.value)}
      />
      <datalist id="course-list">
        {Object.keys(courseData).map(name => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
