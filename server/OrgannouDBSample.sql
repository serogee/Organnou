-- ==========================================
-- SAMPLE DATA FOR CLASSROOM ANNOUNCEMENT SYSTEM
-- ==========================================
-- Run this SQL after creating the database schema
-- This will populate the system with realistic sample data

USE classroom_announcement_system;

-- ==========================================
-- CLEAR ALL EXISTING DATA AND RESET AUTO_INCREMENT
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables
TRUNCATE TABLE announcement_room;
TRUNCATE TABLE announcement_topic;
TRUNCATE TABLE announcement;
TRUNCATE TABLE room;
TRUNCATE TABLE building;
TRUNCATE TABLE topic;

-- Reset auto_increment values
ALTER TABLE announcement_room AUTO_INCREMENT = 1;
ALTER TABLE announcement_topic AUTO_INCREMENT = 1;
ALTER TABLE announcement AUTO_INCREMENT = 1;
ALTER TABLE room AUTO_INCREMENT = 1;
ALTER TABLE building AUTO_INCREMENT = 1;
ALTER TABLE topic AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- INSERT building
-- ==========================================
INSERT INTO building (building_name) VALUES
('CICS Building'),
('FDC Building');

-- ==========================================
-- INSERT room
-- ==========================================
INSERT INTO room (room_name, building_id) VALUES
-- CICS Building Lecture room
('Room 101', 1),
('Room 102', 1),
('Room 103', 1),
('Room 104', 1),
('Room 105', 1),
('Room 106', 1),
-- CICS Building Labs
('Lab 1', 1),
('Lab 2', 1),
('Lab 3', 1),
('Lab 4', 1),
('Lab 5', 1),
('Lab 6', 1),
('ITL', 1),
('Physics Lab', 1),
-- FDC Building
('Gym', 2);

-- ==========================================
-- INSERT topic (HIERARCHICAL STRUCTURE)
-- ==========================================

-- =========================
-- ROOT topic
-- =========================

INSERT INTO topic (topic_name, parent_topic_id) VALUES
-- Root: Organizations
('Organizations', NULL),

-- Root: Courses
('Courses', NULL),

-- Root: Concern Types
('Concerns', NULL),

-- Root: Academic Assessment
('Academic Assessment', NULL);


-- =========================
-- CHILD topic: ORGANIZATIONS
-- =========================

INSERT INTO topic (topic_name, parent_topic_id)
SELECT 'JPCS', topic_id FROM topic WHERE topic_name = 'Organizations'
UNION ALL
SELECT 'CICS-SC', topic_id FROM topic WHERE topic_name = 'Organizations'
UNION ALL
SELECT 'ACCESS', topic_id FROM topic WHERE topic_name = 'Organizations';


-- =========================
-- CHILD topic: COURSES
-- =========================

INSERT INTO topic (topic_name, parent_topic_id)
SELECT 'CS211', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'IT211', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'CpE405', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'GEd109', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'Phy101', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'CS212', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'IT212', topic_id FROM topic WHERE topic_name = 'Courses'
UNION ALL
SELECT 'PATHFit2', topic_id FROM topic WHERE topic_name = 'Courses';


-- =========================
-- CHILD topic: CONCERNS
-- =========================

INSERT INTO topic (topic_name, parent_topic_id)
SELECT 'To Bring', topic_id FROM topic WHERE topic_name = 'Concerns'
UNION ALL
SELECT 'To Accomplish', topic_id FROM topic WHERE topic_name = 'Concerns'
UNION ALL
SELECT 'Org Event', topic_id FROM topic WHERE topic_name = 'Concerns'
UNION ALL
SELECT 'Org Merch', topic_id FROM topic WHERE topic_name = 'Concerns'
UNION ALL
SELECT 'Membership Fee', topic_id FROM topic WHERE topic_name = 'Concerns';


-- =========================
-- CHILD topic: ACADEMIC ASSESSMENTS
-- =========================

INSERT INTO topic (topic_name, parent_topic_id)
SELECT 'Final Exam', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Midterm Exam', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Final Project', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Final Lab Exam', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Midterm Lab Exam', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Activity', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Presentation', topic_id FROM topic WHERE topic_name = 'Academic Assessment'
UNION ALL
SELECT 'Quiz', topic_id FROM topic WHERE topic_name = 'Academic Assessment';


-- ==========================================
-- INSERT announcement (25 announcement SPANNING 3 WEEKS)
-- ==========================================

-- Week 1 announcement (Dec 8-14, 2025)

-- 1. CS211 Final Project Grouping
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CS211 OOP - Final Project Group Formation',
'TODO:
- Form groups of 3 or 4 for OOP final project
- After forming a group, fill up your names in this docs (CS211-Projects section):
https://docs.google.com/placeholder-spreadsheet

Deadline: December 8, ideally before OOP class time',
'2025-12-08 08:00:00',
'2025-12-08 14:00:00',
'2025-12-07 16:30:00');

-- 2. GEd109 Midterm Exam
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('GEd109 STS - Midterm Examination Details',
'MIDTERM EXAM COVERAGE:
- 30 pts Multiple Choice
- 10 pts Identification (12 choices): from 2nd PowerPoint
- 10 pts Essay from 3rd PowerPoint about revolution

Prepare well and good luck!',
'2025-12-09 09:00:00',
'2025-12-09 10:30:00',
'2025-12-07 18:00:00');

-- 3. PATHFit2 Activity Requirements
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('PATHFit2 - Traditional Games Activity Requirements',
'TODO:
- Bring lengthwise half of 1/8 illustration board per group
- Prepare fun activity per group

Make sure your group is ready for tomorrow''s session!',
'2025-12-10 13:00:00',
'2025-12-10 15:00:00',
'2025-12-09 19:45:00');

-- 4. JPCS Project SAFE
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('JPCS Project SAFE: First Aid & Emergency Response Training',
'Project SAFE: Stay Alert, Focused, and Educated

CTRL + S CAN''T SAVE A LIFE.

You can debug code in your sleep. You can optimize an algorithm like a pro. But... can you handle a real-life "crash"?

Be more than just tech-savvy. Be life-savvy.

Join Project SAFE - a hands-on first aid and emergency response training built for you!

Get your hands off the keyboard and learn skills that actually save lives.

We are calling all JPCS Members to step up and join this essential basic first aid and emergency response training.

PRE-REGISTER NOW:
https://forms.gle/placeholder-registration-link',
'2025-12-13 09:00:00',
'2025-12-13 16:00:00',
'2025-12-08 10:00:00');

-- 5. GEd109 Classroom Activity
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('GEd109 STS - Activity in Google Classroom',
'TODO:
- Complete the activity posted in Google Classroom
- Deadline: December 10, 10 AM

Link: https://classroom.google.com/placeholder-activity',
NULL,
'2025-12-10 17:00:00',
'2025-12-08 20:00:00');

-- 6. Student Portfolio Submission
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('UPDATE: Student Portfolio Submission Requirements',
'Most students need to prepare:
REQUIRED:
- Grades of 1ST YEAR, 2ND SEM
- COR of SUMMER CLASS
- Grades of SUMMER CLASS
- COR of 2ND YEAR, 1ST SEM
- Updated SIS
- Updated Student Profile
- Signed Data Privacy Form
- Consultation Form

OPTIONAL:
- Certificates (if included in updated student profile)

All must be printed in LONG BOND PAPER!

Data consent form: https://drive.google.com/placeholder-data-consent
Consultation form: https://drive.google.com/placeholder-consultation',
NULL,
'2025-12-16 17:00:00',
'2025-12-08 14:30:00');

-- 7. CICS-SC Student Incentive Form
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CICS-SC: Student Incentive Form for Competition Participants',
'Good evening!

We are now collecting details from students who have participated or placed in local (competitions within CICS), regional, or national competitions representing the college.

All CICS students who have joined or placed in any competition representing the college should fill out the form below.

Please ensure that all required fields are completed accurately. Late or missing submissions will not be considered for incentives.

Form Link: https://forms.gle/placeholder-incentive-form

Deadline: December 14, 2025 (Sunday), 12:00 PM',
NULL,
'2025-12-14 12:00:00',
'2025-12-09 18:00:00');

-- Week 2 announcement (Dec 15-21, 2025)

-- 8. IT211 Database Final Project
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('IT211 DBMS - Final Project Database Design Submission',
'TODO:
- Submit your database design (ERD and schema) via Google Classroom
- Include normalization documentation (up to 3NF)
- Prepare for next week''s implementation phase

Submission format: PDF document
Deadline: Friday, 5:00 PM',
NULL,
'2025-12-19 17:00:00',
'2025-12-14 09:00:00');

-- 9. CS212 Midterm Lab Exam
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CS212 COAL - Midterm Laboratory Examination',
'MIDTERM LAB EXAM COVERAGE:
- Assembly language programming
- Arithmetic operations
- Branching and looping
- String manipulation

Duration: 2 hours
Bring: Pencil, eraser, scratch paper
No electronic devices except the lab computer',
'2025-12-10 10:00:00',
'2025-12-10 12:00:00',
'2025-12-08 15:30:00');

-- 10. Phy101 Final Lab Exam Schedule
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('Phy101 Physics - Final Laboratory Examination Schedule',
'FINAL LAB EXAM DETAILS:
- Practical examination on mechanics and electricity
- Duration: 1.5 hours per batch
- Bring: Calculator, pen, lab manual

Batch Schedules:
Batch A: 1:00 PM - 2:30 PM
Batch B: 2:30 PM - 4:00 PM

Check your assigned batch in Google Classroom',
'2025-12-11 13:00:00',
'2025-12-11 16:00:00',
'2025-12-08 11:00:00');

-- 11. ACCESS Membership Drive
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('ACCESS Membership Drive 2025 - Join Now!',
'The Association of Committed Computer Science Students is now open for membership!

MEMBERSHIP BENEFITS:
- Exclusive workshops and seminars
- Priority registration for events
- Networking opportunities
- ACCESS merchandise discount

MEMBERSHIP FEE: ₱200 (one-time payment)

Registration booth will be open at CICS Lobby from Monday to Friday, 12:00 PM - 1:00 PM

Sign up now: https://forms.gle/placeholder-access-membership',
NULL,
'2025-12-19 13:00:00',
'2025-12-14 16:45:00');

-- 12. CpE405 Presentation Schedule
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CpE405 Discrete Math - Final Presentation Schedule',
'TODO:
- Prepare 15-minute presentation on your assigned discrete math topic
- Submit presentation slides (PPT/PDF) before your scheduled time
- All group members must be present

topic include: Graph Theory, Set Theory, Combinatorics, Logic

Check presentation schedule: https://docs.google.com/placeholder-schedule',
'2025-12-10 08:00:00',
'2025-12-10 09:30:00',
'2025-12-08 13:20:00');

-- 13. IT212 Network Lab Activity
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('IT212 Networking - Packet Tracer Lab Activity',
'TODO:
- Complete Packet Tracer Lab Exercise 5: Configuring VLANs
- Submit your .pkt file via Google Classroom
- Include screenshot of successful ping tests

Deadline: Thursday, 11:59 PM

Download Packet Tracer: https://www.netacad.com/placeholder',
NULL,
'2025-12-18 23:59:00',
'2025-12-14 19:00:00');

-- 14. JPCS Coding Competition
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('JPCS CodeFest 2025 - Inter-Year Coding Competition',
'JPCS is organizing CodeFest 2025!

CATEGORIES:
- Algorithm Challenge
- Web Development Sprint
- Mobile App Prototype

PRIZES:
1st Place: ₱3,000 + Certificate
2nd Place: ₱2,000 + Certificate
3rd Place: ₱1,000 + Certificate

Registration Fee: ₱50 per participant
Team Size: 1-3 members

Register here: https://forms.gle/placeholder-codefest
Deadline: December 21, 2025',
'2026-01-15 08:00:00',
'2026-01-15 17:00:00',
'2025-12-15 10:00:00');

-- FINALS WEEK (Dec 9, 11, 12, 2025)

-- 15. CS211 Final Exam Schedule (ALIGNED WITH FINALS SCHEDULE IMAGE)
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CS211 OOP - Final Examination Coverage & Schedule',
'FINAL EXAM COVERAGE:
- Object-Oriented Programming concepts (40%)
- Inheritance and Polymorphism (25%)
- Design Patterns (20%)
- Exception Handling (15%)

Format: 50 items Multiple Choice + 2 Coding Problems

Duration: 2 hours
Date: December 9, 2025 (Tuesday), 2:00 PM - 4:00 PM

Bring: Pen, scratch paper, student ID
No programmable calculators allowed',
'2025-12-09 14:00:00',
'2025-12-09 16:00:00',
'2025-12-01 14:00:00');

-- 16. CS212 Final Exam (ALIGNED WITH FINALS SCHEDULE IMAGE)
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CS212 COAL - Final Examination Coverage',
'FINAL EXAM topic:
- Assembly Language Programming (35%)
- Computer Architecture (25%)
- Memory Management (20%)
- I/O Systems (20%)

Exam Type: Written + Practical

Duration: 1.5 hours
Date: December 11, 2025 (Thursday), 2:30 PM - 4:00 PM

Bring: Pen, student ID',
'2025-12-12 14:30:00',
'2025-12-12 16:00:00',
'2025-12-03 13:30:00');

-- 17. Phy101 Final Exam (ALIGNED WITH FINALS SCHEDULE IMAGE)
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('Phy101 Physics - Final Examination Schedule',
'FINAL EXAM COVERAGE:
- Mechanics (30%)
- Electricity and Magnetism (30%)
- Waves and Optics (20%)
- Modern Physics (20%)

Format: 
- Part I: 50 Multiple Choice (60%)
- Part II: 5 Problem Solving (40%)

Duration: 2 hours
Date: December 12, 2025 (Friday), 7:00 AM - 9:00 AM

Bring: Calculator (non-programmable), pen, student ID
Arrive 15 minutes early',
'2025-12-12 07:00:00',
'2025-12-12 09:00:00',
'2025-12-04 10:00:00');

-- 18. CpE405 Final Exam (ALIGNED WITH FINALS SCHEDULE IMAGE)
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CpE405 Discrete Math - Final Examination Schedule',
'FINAL EXAM COVERAGE:
- Graph Theory (25%)
- Combinatorics (25%)
- Boolean Algebra (20%)
- Number Theory (15%)
- Logic and Proofs (15%)

Format: 
- Part I: 40 Multiple Choice (60%)
- Part II: 5 Problem Solving (40%)

Duration: 2 hours
Date: December 12, 2025 (Friday), 11:00 AM - 1:00 PM

Allowed: Calculator (non-programmable), pen',
'2025-12-12 11:00:00',
'2025-12-12 13:00:00',
'2025-12-04 09:00:00');

-- POST-FINALS announcement

-- 19. IT211 Final Exam Schedule
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('IT211 DBMS - Final Examination Details',
'FINAL EXAM COVERAGE:
- SQL Queries (SELECT, JOIN, Subqueries) - 30%
- Normalization (1NF to BCNF) - 25%
- Transaction Management & Concurrency - 20%
- Database Design (ERD, Schema) - 25%

Format: 60 items (40 Multiple Choice + 10 SQL Problems + 10 Design Problems)

Duration: 2.5 hours
Date: December 15, 2025 (Monday), 1:00 PM - 3:30 PM

Allowed materials: Pen only',
'2025-12-15 13:00:00',
'2025-12-15 15:30:00',
'2025-12-07 09:30:00');

-- 20. GEd109 Final Requirements
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('GEd109 STS - Final Requirements Compilation',
'TODO:
- Compile ALL activities, essays, and reflection papers
- Arrange in chronological order with cover page
- Bind or place in long folder

CONTENTS CHECKLIST:
✓ 5 Reflection Papers
✓ 3 Essay Assignments
✓ Group Case Study
✓ Technology Impact Analysis

Submission: December 17, 2025 (no late submissions)
Submit to: Faculty office or during class time',
NULL,
'2025-12-17 17:00:00',
'2025-12-10 16:00:00');

-- 21. IT212 Final Project Demo
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('IT212 Networking - Final Project Demonstration',
'TODO:
- Prepare your network topology implementation
- Demo should show: routing, switching, VLAN configuration
- Prepare 10-minute presentation + 5-minute Q&A
- Submit documentation (10-15 pages)

Demo Schedule: December 16-17, 2025
Sign up for your time slot: https://docs.google.com/placeholder-demo-schedule

Grading: Implementation (40%), Presentation (30%), Documentation (30%)',
NULL,
'2025-12-17 17:00:00',
'2025-12-09 10:00:00');

-- 22. PATHFit2 Final Activity
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('PATHFit2 - Final Practical Examination',
'FINAL PRACTICAL EXAM:
- Traditional Filipino Games Tournament
- Each group will facilitate one game
- All students must participate

TO BRING:
- PE uniform
- Water bottle
- Towel
- Whistle (for facilitators)

Date: December 18, 2025 (Thursday), 1:00 PM - 4:00 PM
Venue: Gymnasium

Be on time! Attendance is 30% of your grade.',
'2025-12-18 13:00:00',
'2025-12-18 16:00:00',
'2025-12-11 15:00:00');

-- 23. CICS-SC General Assembly
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('CICS-SC General Assembly - Semester Wrap-up & Elections',
'You are invited to the CICS Student Council General Assembly!

AGENDA:
- Semester accomplishments report
- Financial report
- Next semester plans
- Officer elections for AY 2025-2026

Attendance is encouraged for all CICS students!

Date: December 19, 2025 (Friday)
Time: 3:00 PM - 5:00 PM
Venue: CICS Auditorium

Snacks will be provided!',
'2025-12-19 15:00:00',
'2025-12-19 17:00:00',
'2025-12-12 11:00:00');

-- 24. ACCESS Year-End Party
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('ACCESS Year-End Celebration & Awarding',
'Join us for ACCESS Year-End Celebration!

PROGRAM:
- Opening remarks
- Year in review video
- Awards and recognition
- Games and raffle
- Fellowship and dinner

REGISTRATION FEE: ₱150
Includes: Dinner, party favors, raffle entry

Date: December 20, 2025 (Saturday)
Time: 5:00 PM - 9:00 PM
Venue: CICS Function Hall

Register here: https://forms.gle/placeholder-access-party
Deadline: December 17, 2025

Bring your friends! Non-members welcome!',
'2025-12-20 17:00:00',
'2025-12-20 21:00:00',
'2025-12-12 12:00:00');

-- 25. JPCS Merchandise Pre-order
INSERT INTO announcement (title, description, start_date, end_date, created_at) VALUES
('JPCS Official Merchandise Pre-order Now Open!',
'JPCS Merch Drop 2025 is here!

AVAILABLE ITEMS:
- JPCS T-Shirt (Navy/White) - ₱350
- JPCS Hoodie (Black/Gray) - ₱650
- JPCS Tumbler (Stainless) - ₱250
- JPCS Laptop Stickers Set - ₱100
- JPCS Lanyard - ₱80

MEMBER DISCOUNT: 10% off on all items!

Pre-order form: https://forms.gle/placeholder-jpcs-merch
Payment deadline: December 22, 2025
Expected delivery: Early January 2026

Limited stocks! Order now!

For inquiries, message our Facebook page.',
NULL,
'2025-12-22 23:59:00',
'2025-12-13 16:30:00');

-- ==========================================
-- LINK announcement TO topic
-- ==========================================

-- Announcement 1: CS211 Final Project (CS211, Final Project, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(1, (SELECT topic_id FROM topic WHERE topic_name = 'CS211')),
(1, (SELECT topic_id FROM topic WHERE topic_name = 'Final Project')),
(1, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 2: GEd109 Midterm Exam (GEd109, Midterm Exam)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(2, (SELECT topic_id FROM topic WHERE topic_name = 'GEd109')),
(2, (SELECT topic_id FROM topic WHERE topic_name = 'Midterm Exam'));

-- Announcement 3: PATHFit2 Activity (PATHFit2, To Bring, Activity)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(3, (SELECT topic_id FROM topic WHERE topic_name = 'PATHFit2')),
(3, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring')),
(3, (SELECT topic_id FROM topic WHERE topic_name = 'Activity'));

-- Announcement 4: JPCS Project SAFE (JPCS, Org Event)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(4, (SELECT topic_id FROM topic WHERE topic_name = 'JPCS')),
(4, (SELECT topic_id FROM topic WHERE topic_name = 'Org Event'));

-- Announcement 5: GEd109 Activity (GEd109, Activity, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(5, (SELECT topic_id FROM topic WHERE topic_name = 'GEd109')),
(5, (SELECT topic_id FROM topic WHERE topic_name = 'Activity')),
(5, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 6: Student Portfolio (To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(6, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 7: CICS-SC Incentive (CICS-SC, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(7, (SELECT topic_id FROM topic WHERE topic_name = 'CICS-SC')),
(7, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 8: IT211 Final Project (IT211, Final Project, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(8, (SELECT topic_id FROM topic WHERE topic_name = 'IT211')),
(8, (SELECT topic_id FROM topic WHERE topic_name = 'Final Project')),
(8, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 9: CS212 Midterm Lab Exam (CS212, Midterm Lab Exam, To Bring)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(9, (SELECT topic_id FROM topic WHERE topic_name = 'CS212')),
(9, (SELECT topic_id FROM topic WHERE topic_name = 'Midterm Lab Exam')),
(9, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring'));

-- Announcement 10: Phy101 Final Lab Exam (Phy101, Final Lab Exam, To Bring)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(10, (SELECT topic_id FROM topic WHERE topic_name = 'Phy101')),
(10, (SELECT topic_id FROM topic WHERE topic_name = 'Final Lab Exam')),
(10, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring'));

-- Announcement 11: ACCESS Membership (ACCESS, Membership Fee, Org Event)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(11, (SELECT topic_id FROM topic WHERE topic_name = 'ACCESS')),
(11, (SELECT topic_id FROM topic WHERE topic_name = 'Membership Fee')),
(11, (SELECT topic_id FROM topic WHERE topic_name = 'Org Event'));

-- Announcement 12: CpE405 Presentation (CpE405, Presentation, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(12, (SELECT topic_id FROM topic WHERE topic_name = 'CpE405')),
(12, (SELECT topic_id FROM topic WHERE topic_name = 'Presentation')),
(12, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 13: IT212 Lab Activity (IT212, Activity, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(13, (SELECT topic_id FROM topic WHERE topic_name = 'IT212')),
(13, (SELECT topic_id FROM topic WHERE topic_name = 'Activity')),
(13, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 14: JPCS CodeFest (JPCS, Org Event, Membership Fee)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(14, (SELECT topic_id FROM topic WHERE topic_name = 'JPCS')),
(14, (SELECT topic_id FROM topic WHERE topic_name = 'Org Event')),
(14, (SELECT topic_id FROM topic WHERE topic_name = 'Membership Fee'));

-- Announcement 15: CS211 Final Exam (CS211, Final Exam, To Bring)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(15, (SELECT topic_id FROM topic WHERE topic_name = 'CS211')),
(15, (SELECT topic_id FROM topic WHERE topic_name = 'Final Exam')),
(15, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring'));

-- Announcement 16: IT211 Final Exam (IT211, Final Exam)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(16, (SELECT topic_id FROM topic WHERE topic_name = 'IT211')),
(16, (SELECT topic_id FROM topic WHERE topic_name = 'Final Exam'));

-- Announcement 17: GEd109 Final Requirements (GEd109, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(17, (SELECT topic_id FROM topic WHERE topic_name = 'GEd109')),
(17, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 18: Phy101 Problem Set (Phy101, Activity, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(18, (SELECT topic_id FROM topic WHERE topic_name = 'Phy101')),
(18, (SELECT topic_id FROM topic WHERE topic_name = 'Activity')),
(18, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 19: CICS-SC General Assembly (CICS-SC, Org Event)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(19, (SELECT topic_id FROM topic WHERE topic_name = 'CICS-SC')),
(19, (SELECT topic_id FROM topic WHERE topic_name = 'Org Event'));

-- Announcement 20: CS212 Final Exam (CS212, Final Exam, To Bring)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(20, (SELECT topic_id FROM topic WHERE topic_name = 'CS212')),
(20, (SELECT topic_id FROM topic WHERE topic_name = 'Final Exam')),
(20, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring'));

-- Announcement 21: IT212 Final Project (IT212, Final Project, Presentation, To Accomplish)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(21, (SELECT topic_id FROM topic WHERE topic_name = 'IT212')),
(21, (SELECT topic_id FROM topic WHERE topic_name = 'Final Project')),
(21, (SELECT topic_id FROM topic WHERE topic_name = 'Presentation')),
(21, (SELECT topic_id FROM topic WHERE topic_name = 'To Accomplish'));

-- Announcement 22: PATHFit2 Final (PATHFit2, Activity, To Bring)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(22, (SELECT topic_id FROM topic WHERE topic_name = 'PATHFit2')),
(22, (SELECT topic_id FROM topic WHERE topic_name = 'Activity')),
(22, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring'));

-- Announcement 23: CpE405 Final Exam (CpE405, Final Exam, To Bring)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(23, (SELECT topic_id FROM topic WHERE topic_name = 'CpE405')),
(23, (SELECT topic_id FROM topic WHERE topic_name = 'Final Exam')),
(23, (SELECT topic_id FROM topic WHERE topic_name = 'To Bring'));

-- Announcement 24: ACCESS Party (ACCESS, Org Event, Membership Fee)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(24, (SELECT topic_id FROM topic WHERE topic_name = 'ACCESS')),
(24, (SELECT topic_id FROM topic WHERE topic_name = 'Org Event')),
(24, (SELECT topic_id FROM topic WHERE topic_name = 'Membership Fee'));

-- Announcement 25: JPCS Merch (JPCS, Org Merch)
INSERT INTO announcement_topic (announcement_id, topic_id) VALUES
(25, (SELECT topic_id FROM topic WHERE topic_name = 'JPCS')),
(25, (SELECT topic_id FROM topic WHERE topic_name = 'Org Merch'));

-- ==========================================
-- LINK announcement TO room
-- ==========================================

-- Announcement 1: CS211 - Room 103
INSERT INTO announcement_room (announcement_id, room_id) VALUES (1, 3);

-- Announcement 2: GEd109 - Room 105
INSERT INTO announcement_room (announcement_id, room_id) VALUES (2, 5);

-- Announcement 3: PATHFit2 - Gym
INSERT INTO announcement_room (announcement_id, room_id) VALUES (3, 15);

-- Announcement 4: JPCS Event - Room 101, Room 102
INSERT INTO announcement_room (announcement_id, room_id) VALUES (4, 1), (4, 2);

-- Announcement 5: GEd109 - Room 105
INSERT INTO announcement_room (announcement_id, room_id) VALUES (5, 5);

-- Announcement 9: CS212 - Lab 2
INSERT INTO announcement_room (announcement_id, room_id) VALUES (9, 8);

-- Announcement 10: Phy101 - Physics Lab
INSERT INTO announcement_room (announcement_id, room_id) VALUES (10, 14);

-- Announcement 12: CpE405 - Room 103
INSERT INTO announcement_room (announcement_id, room_id) VALUES (12, 3);

-- Announcement 14: JPCS CodeFest - Lab 1, Lab 2, Lab 3
INSERT INTO announcement_room (announcement_id, room_id) VALUES (14, 7), (14, 8), (14, 9);

-- Announcement 15: CS211 Final Exam - Room 103
INSERT INTO announcement_room (announcement_id, room_id) VALUES (15, 3);

-- Announcement 18: Phy101 - Room 106
INSERT INTO announcement_room (announcement_id, room_id) VALUES (18, 6);

-- Announcement 19: CICS-SC General Assembly - Room 101, Room 102
INSERT INTO announcement_room (announcement_id, room_id) VALUES (19, 1), (19, 2);

-- Announcement 22: PATHFit2 Final - Gym
INSERT INTO announcement_room (announcement_id, room_id) VALUES (22, 15);

-- Announcement 23: CpE405 Final Exam - Room 104
INSERT INTO announcement_room (announcement_id, room_id) VALUES (23, 4);

-- Announcement 24: ACCESS Year-End Party - Room 101, Room 102, Room 103
INSERT INTO announcement_room (announcement_id, room_id) VALUES (24, 1), (24, 2), (24, 3);

-- ==========================================
-- END OF SAMPLE DATA
-- ==========================================

-- Verification queries (optional - uncomment to run)
-- SELECT COUNT(*) AS total_announcement FROM announcement;
-- SELECT COUNT(*) AS total_topic FROM topic;
-- SELECT COUNT(*) AS total_room FROM room;
-- SELECT COUNT(*) AS total_building FROM building;
-- SELECT COUNT(*) AS announcement_topic_links FROM announcement_topic;
-- SELECT COUNT(*) AS announcement_room_links FROM announcement_room;