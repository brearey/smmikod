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

BEGIN;
INSERT INTO "IDENT_Branches" ("Id", "Name") VALUES (1, 'ТЕСТ: Стоматология на Центральной');
INSERT INTO "IDENT_Branches" ("Id", "Name") VALUES (2, 'ТЕСТ: Клиника на Северной');
INSERT INTO "IDENT_Branches" ("Id", "Name") VALUES (3, 'ТЕСТ: Детское отделение');
INSERT INTO "IDENT_Branches" ("Id", "Name") VALUES (4, 'ТЕСТ: Филиал "Премиум"');
INSERT INTO "IDENT_Branches" ("Id", "Name") VALUES (5, 'ТЕСТ: Ортодонтический центр');

INSERT INTO "IDENT_Doctors" ("Id", "Name") VALUES (101, 'ТЕСТ: Смирнов Алексей Петрович');
INSERT INTO "IDENT_Doctors" ("Id", "Name") VALUES (102, 'ТЕСТ: Иванова Мария Викторовна');
INSERT INTO "IDENT_Doctors" ("Id", "Name") VALUES (103, 'ТЕСТ: Попов Сергей Александрович');
INSERT INTO "IDENT_Doctors" ("Id", "Name") VALUES (104, 'ТЕСТ: Ковалев Дмитрий Игоревич');
INSERT INTO "IDENT_Doctors" ("Id", "Name") VALUES (105, 'ТЕСТ: Кузнецова Ольга Сергеевна');
INSERT INTO "IDENT_Doctors" ("Id", "Name") VALUES (106, 'ТЕСТ: Новикова Анна Владимировна');

INSERT INTO "IDENT_Tickets" ("Id", "DateAndTime", "ClientPhone", "ClientEmail", "FormName", "ClientFullName", "PlanStart", "PlanEnd", "Comment", "DoctorId", "DoctorName", "UtmSource", "HttpReferer")
VALUES ('550e8400-e29b-41d4-a716-446655440001', '2025-12-16 14:30:00', '+7 911 123-45-67', 'ivanov@example.com', 'ТЕСТ: Онлайн-запись с главной страницы', 'ТЕСТ: Иванов Иван Иванович', '2025-12-20 09:00:00', '2025-12-20 09:30:00', 'ТЕСТ: Болит верхний зуб справа', 101, 'ТЕСТ: Смирнов Алексей Петрович', 'ТЕСТ: google', 'https://stomatologia-example.ru/');

INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (1, 101, '2025-12-20 09:00:00', 30, true);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (1, 101, '2025-12-20 09:30:00', 30, false);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (1, 102, '2025-12-20 10:00:00', 60, false);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (2, 105, '2025-12-20 11:00:00', 45, false);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (3, 103, '2025-12-20 14:00:00', 120, true);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (4, 104, '2025-12-21 08:00:00', 90, false);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (5, 106, '2025-12-21 13:00:00', 60, true);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (1, 101, '2025-12-21 16:00:00', 30, false);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (2, 102, '2025-12-22 09:00:00', 45, false);
INSERT INTO "IDENT_Intervals" ("BranchId", "DoctorId", "StartDateTime", "LengthInMinutes", "IsBusy") VALUES (3, 103, '2025-12-22 14:00:00', 120, false);

COMMIT;