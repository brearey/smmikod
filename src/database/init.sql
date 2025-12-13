DROP TABLE IF EXISTS "IDENT_Tickets";
DROP TABLE IF EXISTS "IDENT_Intervals";
DROP TABLE IF EXISTS "IDENT_Doctors";
DROP TABLE IF EXISTS "IDENT_Branches";

CREATE TABLE "IDENT_Branches" (
    "Id" INT NOT NULL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL
);

CREATE TABLE "IDENT_Doctors" (
    "Id" INT NOT NULL PRIMARY KEY,
    "Name" VARCHAR(255) NOT NULL
);

CREATE TABLE "IDENT_Tickets" (
    "Id" VARCHAR(400) NOT NULL PRIMARY KEY,
    "DateAndTime" TIMESTAMP NOT NULL,
    "ClientPhone" VARCHAR(100),
    "ClientEmail" VARCHAR(255),
    "FormName" VARCHAR(255),
    "ClientFullName" VARCHAR(255),
    "ClientSurname" VARCHAR(100),
    "ClientName" VARCHAR(100),
    "ClientPatronymic" VARCHAR(100),
    "PlanStart" TIMESTAMP,
    "PlanEnd" TIMESTAMP,
    "Comment" TEXT,
    "DoctorId" INT,
    "DoctorName" VARCHAR(255),
    "UtmSource" VARCHAR(255),
    "UtmMedium" VARCHAR(255),
    "UtmCampaign" VARCHAR(255),
    "UtmTerm" VARCHAR(255),
    "UtmContent" VARCHAR(255),
    "HttpReferer" VARCHAR(500),
    
    CONSTRAINT "chk_dates" CHECK ("PlanEnd" IS NULL OR "PlanStart" IS NULL OR "PlanEnd" >= "PlanStart"),
    CONSTRAINT "chk_duration" CHECK ("PlanEnd" IS NULL OR "PlanStart" IS NULL OR 
                                  (EXTRACT(EPOCH FROM ("PlanEnd" - "PlanStart")) / 3600) <= 12),
    CONSTRAINT "chk_name_fields" CHECK (
        ("ClientFullName" IS NOT NULL AND 
         "ClientSurname" IS NULL AND 
         "ClientName" IS NULL AND 
         "ClientPatronymic" IS NULL)
        OR
        ("ClientFullName" IS NULL AND 
         ("ClientSurname" IS NOT NULL OR 
          "ClientName" IS NOT NULL OR 
          "ClientPatronymic" IS NOT NULL))
        OR
        ("ClientFullName" IS NULL AND 
         "ClientSurname" IS NULL AND 
         "ClientName" IS NULL AND 
         "ClientPatronymic" IS NULL)
    )
);

CREATE TABLE "IDENT_Intervals" (
    "BranchId" INT NOT NULL,
    "DoctorId" INT NOT NULL,
    "StartDateTime" TIMESTAMP NOT NULL,
    "LengthInMinutes" INT NOT NULL,
    "IsBusy" BOOLEAN NOT NULL,
    PRIMARY KEY ("BranchId", "DoctorId", "StartDateTime"),
    CONSTRAINT "fk_intervals_branch" FOREIGN KEY ("BranchId") 
        REFERENCES "IDENT_Branches"("Id") ON DELETE CASCADE,
    CONSTRAINT "fk_intervals_doctor" FOREIGN KEY ("DoctorId") 
        REFERENCES "IDENT_Doctors"("Id") ON DELETE CASCADE
);

INSERT INTO "IDENT_Tickets"
(
  "Id",
  "DateAndTime",
  "ClientPhone",
  "ClientEmail",
  "FormName",
  "ClientFullName",
  "PlanStart",
  "PlanEnd",
  "Comment",
  "DoctorId",
  "DoctorName",
  "UtmSource",
  "HttpReferer"
)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  now(),
  '+7 999 999-99-99',
  'ivanov@test.ru',
  'ТЕСТ: Онлайн-запись с главной страницы',
  'ТЕСТ: Иванов Иван Иванович',
  '2025-12-18 09:00:00',
  '2025-12-18 09:30:00',
  'ТЕСТ: Болит верхний зуб справа',
  101,
  'ТЕСТ: Петров Петр Петрович',
  'ТЕСТ: google',
  'https://test.ru/'
);