-- Create daily_center_report table
CREATE TABLE daily_center_report (
    id SERIAL PRIMARY KEY,
    center_id INTEGER NOT NULL,
    date DATE NOT NULL,
    diary_info TEXT,
    volunteer_notes TEXT,
    center_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(center_id, date)
);

-- Create history_files table
CREATE TABLE history_files (
    id SERIAL PRIMARY KEY,
    file_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    center_id INTEGER,
    student_id VARCHAR(50),
    description TEXT,
    uploaded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_daily_center_report_center_id ON daily_center_report(center_id);
CREATE INDEX idx_daily_center_report_date ON daily_center_report(date);
CREATE INDEX idx_history_files_file_type ON history_files(file_type);
CREATE INDEX idx_history_files_date ON history_files(date);
CREATE INDEX idx_history_files_center_id ON history_files(center_id);
CREATE INDEX idx_history_files_student_id ON history_files(student_id);

