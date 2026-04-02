-- Adiciona campo de tema de cores à clínica
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS theme_color TEXT NOT NULL DEFAULT 'purple'
    CONSTRAINT clinics_theme_color_check
      CHECK (theme_color IN ('purple', 'blue', 'teal', 'green', 'rose', 'orange', 'indigo'));
