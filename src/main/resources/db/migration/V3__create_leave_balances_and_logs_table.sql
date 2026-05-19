CREATE TABLE IF NOT EXISTS leave_balances (
    id               BIGSERIAL    PRIMARY KEY,
    user_id          BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year             INT          NOT NULL,
    total_days       NUMERIC(4,1) NOT NULL DEFAULT 12.0,
    used_days        NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    carried_over_days NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, year)
);

CREATE TABLE IF NOT EXISTS leave_accumulation_logs (
    id           BIGSERIAL    PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_year    INT          NOT NULL,
    to_year      INT          NOT NULL,
    days_carried NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    days_expired NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
