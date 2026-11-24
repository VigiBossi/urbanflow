/* =====================================================================
   MODULE 2 — ERD to Relational Schema (mapping) + Metro Bus case study
   Schema answers use:  TABLE(Attr PK, Attr, Attr FK->OTHER UNIQUE)
   "model" may be an array of acceptable answers (best match is used).
   ===================================================================== */
CONTENT.modules.push({
  id: 'm2',
  title: 'ERD to Relational Schema',
  short: 'Mapping ERD → Tables',
  icon: '▦',
  description: 'Map every part of an ERD to tables, primary keys and foreign keys — with a Metro Bus case study.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'm2l1',
      title: 'Strong entities and their attributes',
      minutes: 15,
      intuition: `<p>An ERD is a drawing; a database is made of <b>tables</b>. Mapping is just translating the drawing into tables with a fixed set of rules — like translating a sentence word by word. Each rectangle usually becomes a table, and each oval becomes a column. A table column can hold only <b>one simple value</b>, so anything with parts or with many values needs special treatment.</p>`,
      formal: `<ul>
<li><b>Strong entity → table.</b> Its key attribute becomes the <b>primary key (PK)</b>.</li>
<li><b>Composite attribute → only its simple parts</b> become columns (Name → FirstName, LastName). The composite name itself is not a column.</li>
<li><b>Derived attribute → not stored</b> (compute it in a query: Age from DOB).</li>
<li><b>Multivalued attribute → new table</b> (OwnerKey, Value). OwnerKey is a <b>foreign key (FK)</b> to the owner table, and the <b>PK is both columns</b> (so the same value is not repeated, but an owner can have many values).</li>
</ul>
<p>Notation in this app: <code>STUDENT(StudentID PK, FirstName, LastName)</code>, <code>STUDENT_EMAIL(StudentID PK FK->STUDENT, Email PK)</code>.</p>`,
      worked: {
        problem: `<p>Map: STUDENT(<u>StudentID</u>, Name(FirstName, LastName), BirthDate, /Age/, {Email}).</p>`,
        erd: `ENTITY STUDENT: *StudentID, Name(FirstName, LastName), BirthDate, /Age, [Email]`,
        steps: [
          `<b>Strong entity</b> STUDENT → table STUDENT with PK StudentID.`,
          `<b>Composite</b> Name → columns FirstName, LastName.`,
          `<b>Simple</b> BirthDate → column.`,
          `<b>Derived</b> Age → <i>not stored</i> (it would become wrong every birthday!).`,
          `<b>Multivalued</b> Email → new table STUDENT_EMAIL(StudentID, Email). StudentID is an FK to STUDENT; PK = (StudentID, Email).`,
          `<b>Result:</b><br><code>STUDENT(StudentID PK, FirstName, LastName, BirthDate)</code><br><code>STUDENT_EMAIL(StudentID PK FK->STUDENT, Email PK)</code>`
        ]
      },
      exercises: [
        {
          id: 'm2l1e1', type: 'schema', level: 1, tags: ['composite-not-split', 'multivalued-not-split', 'derived-stored'],
          prompt: `Map this entity to tables.`,
          erd: `ENTITY CUSTOMER: *CustomerID, Name(FirstName, LastName), Address(Street, City, ZIP), [Email], DateOfBirth, /Age`,
          model: `CUSTOMER(CustomerID PK, FirstName, LastName, Street, City, ZIP, DateOfBirth)
CUSTOMER_EMAIL(CustomerID PK FK->CUSTOMER, Email PK)`,
          notes: { kinds: { CUSTOMER_EMAIL: 'multi' }, composite: { Name: ['FirstName', 'LastName'], Address: ['Street', 'City', 'ZIP'] }, derived: ['Age'], multivalued: { Email: 'CUSTOMER_EMAIL' } },
          aliases: { CUSTOMER_EMAIL: ['EMAIL', 'CUSTOMEREMAILS', 'CUST_EMAIL'] },
          hints: ['Two tables.', 'Split Name and Address into their parts; drop Age.', 'Email needs its own table with the customer key; both columns form the PK.'],
          solution: `<code>CUSTOMER(CustomerID PK, FirstName, LastName, Street, City, ZIP, DateOfBirth)</code><br><code>CUSTOMER_EMAIL(CustomerID PK FK->CUSTOMER, Email PK)</code><br>Age is derived → not stored.`
        },
        {
          id: 'm2l1e2', type: 'mcq', level: 2, tags: ['multivalued-not-split', 'pk-wrong'],
          prompt: `DOCTOR(DoctorID, …) has a multivalued attribute Phone. What is the primary key of the table DOCTOR_PHONE(DoctorID, Phone)?`,
          options: ['DoctorID', 'Phone', '(DoctorID, Phone)', 'A new PhoneID'], answer: 2,
          hints: ['Can one doctor appear in several rows? Can one phone value appear in several rows?'],
          solution: `A doctor has many phones, so DoctorID alone repeats. The pair <b>(DoctorID, Phone)</b> is unique → PK = both columns.`
        },
        {
          id: 'm2l1e3', type: 'schema', level: 3, tags: ['composite-not-split', 'multivalued-not-split', 'derived-stored'],
          prompt: `Map the DRIVER entity of the Metro Bus company.`,
          erd: `ENTITY DRIVER: *DriverID, Name(FirstName, LastName), HireDate, /YearsOfService, [Phone], [LicenseClass]`,
          model: `DRIVER(DriverID PK, FirstName, LastName, HireDate)
DRIVER_PHONE(DriverID PK FK->DRIVER, Phone PK)
DRIVER_LICENSE(DriverID PK FK->DRIVER, LicenseClass PK)`,
          notes: { kinds: { DRIVER_PHONE: 'multi', DRIVER_LICENSE: 'multi' }, composite: { Name: ['FirstName', 'LastName'] }, derived: ['YearsOfService'], multivalued: { Phone: 'DRIVER_PHONE', LicenseClass: 'DRIVER_LICENSE' } },
          aliases: { DRIVER_LICENSE: ['DRIVER_LICENSECLASS', 'LICENSE', 'DRIVER_LICENSES', 'LICENSECLASS'], DRIVER_PHONE: ['PHONE', 'DRIVERPHONES'] },
          hints: ['Two multivalued attributes → two extra tables.', 'YearsOfService can be computed from HireDate.'],
          solution: `<code>DRIVER(DriverID PK, FirstName, LastName, HireDate)</code><br><code>DRIVER_PHONE(DriverID PK FK->DRIVER, Phone PK)</code><br><code>DRIVER_LICENSE(DriverID PK FK->DRIVER, LicenseClass PK)</code><br>YearsOfService is derived → not stored.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'A derived attribute in the ERD becomes…', options: ['a column', 'a new table', 'nothing — it is not stored', 'a foreign key'], answer: 2, explain: 'Derived values are computed when needed (e.g. in a query or view).' },
        { type: 'mcq', prompt: 'A composite attribute Address(Street, City, ZIP) becomes…', options: ['one column Address', 'three columns Street, City, ZIP', 'a new table ADDRESS', 'a multivalued table'], answer: 1, explain: 'Only the simple parts become columns.' },
        { type: 'mcq', prompt: 'A multivalued attribute Skill of EMPLOYEE becomes…', options: ['a column Skill in EMPLOYEE', 'columns Skill1, Skill2, Skill3', 'a table EMPLOYEE_SKILL(EmpID, Skill) with PK (EmpID, Skill)', 'a derived attribute'], answer: 2, explain: 'Skill1/Skill2/... wastes space and limits the count; a separate table is correct.' },
        { type: 'text', prompt: 'In EMPLOYEE_SKILL(EmpID, Skill), EmpID is a foreign key that references which table?', keywords: [['employee']], sample: 'EMPLOYEE', explain: 'The owner key points back to the owner table.' },
        { type: 'mcq', prompt: 'A strong entity\'s key attribute becomes…', options: ['the primary key', 'a foreign key', 'a UNIQUE column only', 'a separate table'], answer: 0, explain: 'Strong entity → table, key → PK.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm2l2',
      title: 'Weak entities',
      minutes: 12,
      intuition: `<p>A weak entity could not identify itself in the ERD, so in its table it must <b>borrow its owner's key</b>. Think of an apartment address: "Flat 3" only works together with the building's address. The table stores both, and the pair is the primary key. And if the building is demolished, its flats disappear too → <b>ON DELETE CASCADE</b>.</p>`,
      formal: `<ul>
<li><b>Weak entity → table</b> containing: the <b>owner's PK as FK</b> + the <b>partial key</b> + its other attributes.</li>
<li><b>PK = owner key + partial key.</b></li>
<li>The FK uses <b>ON DELETE CASCADE</b>: deleting the owner deletes its weak entities (they cannot exist alone).</li>
<li>The identifying relationship itself does <b>not</b> get a table — the FK already represents it.</li>
</ul>`,
      worked: {
        problem: `<p>Map EMPLOYEE(<u>EmpID</u>, Name) — HAS_DEPENDENT — weak DEPENDENT(<i>DepName</i> partial key, BirthDate).</p>`,
        erd: `ENTITY EMPLOYEE: *EmpID, Name
WEAK DEPENDENT: ~DepName, BirthDate
IDREL HAS_DEPENDENT: EMPLOYEE 1, DEPENDENT N total`,
        steps: [
          `EMPLOYEE is strong → <code>EMPLOYEE(EmpID PK, Name)</code>.`,
          `DEPENDENT is weak → its table gets the owner's key EmpID as FK, plus the partial key DepName.`,
          `PK = (EmpID, DepName): two employees can both have a "Sara", but one employee cannot have two dependents with the same name.`,
          `<code>DEPENDENT(EmpID PK FK->EMPLOYEE, DepName PK, BirthDate)</code> with ON DELETE CASCADE on EmpID.`,
          `In SQL: <code>CREATE TABLE DEPENDENT (EmpID INT REFERENCES EMPLOYEE(EmpID) ON DELETE CASCADE, DepName TEXT, BirthDate DATE, PRIMARY KEY (EmpID, DepName));</code>`
        ]
      },
      exercises: [
        {
          id: 'm2l2e1', type: 'schema', level: 1, tags: ['weak-entity-key'],
          prompt: `Map the hotel ERD to tables.`,
          erd: `ENTITY HOTEL: *HotelID, Name, City
WEAK ROOM: ~RoomNo, Floor, Price
IDREL HAS_ROOM: HOTEL 1, ROOM N total`,
          model: `HOTEL(HotelID PK, Name, City)
ROOM(HotelID PK FK->HOTEL, RoomNo PK, Floor, Price)`,
          notes: { kinds: { ROOM: 'weak' } },
          hints: ['ROOM must borrow its owner\'s key.', 'PK of ROOM = HotelID + RoomNo.'],
          solution: `<code>HOTEL(HotelID PK, Name, City)</code><br><code>ROOM(HotelID PK FK->HOTEL, RoomNo PK, Floor, Price)</code> — FK with ON DELETE CASCADE.`
        },
        {
          id: 'm2l2e2', type: 'text', level: 2, tags: ['weak-entity-key'],
          prompt: `Why do we declare the FK of a weak entity table with <code>ON DELETE CASCADE</code>? (one sentence)`,
          keywords: [['owner', 'parent', 'hotel', 'employee', 'building'], ['delet', 'remov', 'cannot exist', 'not exist', 'exist']],
          sample: 'Because a weak entity cannot exist without its owner, so when the owner is deleted its weak entities must be deleted too.',
          hints: ['What happens to the rooms if the hotel row is deleted?'],
          solution: `A weak entity <b>cannot exist without its owner</b> (existence dependency). When the owner row is deleted, its weak rows must disappear too, otherwise they would point to nothing.`
        },
        {
          id: 'm2l2e3', type: 'schema', level: 3, tags: ['weak-entity-key', 'multivalued-not-split'],
          prompt: `Metro Bus: buses get maintenance records numbered 1, 2, 3 … per bus. Map the ERD.`,
          erd: `ENTITY BUS: *BusID, Plate, Capacity, Model
WEAK MAINTENANCE: ~RecordNo, ServiceDate, Cost, [Mechanic]
IDREL HAS_RECORD: BUS 1, MAINTENANCE N total`,
          model: `BUS(BusID PK, Plate, Capacity, Model)
MAINTENANCE(BusID PK FK->BUS, RecordNo PK, ServiceDate, Cost)
MAINTENANCE_MECHANIC(BusID PK FK->MAINTENANCE, RecordNo PK FK->MAINTENANCE, Mechanic PK)`,
          notes: { kinds: { MAINTENANCE: 'weak', MAINTENANCE_MECHANIC: 'multi' }, multivalued: { Mechanic: 'MAINTENANCE_MECHANIC' } },
          aliases: { MAINTENANCE_MECHANIC: ['MECHANIC', 'MAINTENANCE_MECHANICS', 'RECORD_MECHANIC'] },
          hints: ['MAINTENANCE is weak: PK = BusID + RecordNo.', 'Twist: Mechanic is multivalued on a WEAK entity. Its owner key is the weak entity\'s full key (BusID, RecordNo).'],
          solution: `<code>BUS(BusID PK, Plate, Capacity, Model)</code><br><code>MAINTENANCE(BusID PK FK->BUS, RecordNo PK, ServiceDate, Cost)</code><br><code>MAINTENANCE_MECHANIC(BusID PK, RecordNo PK, Mechanic PK)</code> where (BusID, RecordNo) together is an FK to MAINTENANCE. The owner key of a multivalued attribute is the <i>whole</i> key of its entity.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'The PK of a weak entity\'s table is…', options: ['its partial key', 'the owner\'s PK', 'owner\'s PK + partial key', 'a new surrogate ID'], answer: 2, explain: 'Owner key + partial key identifies a weak entity.' },
        { type: 'mcq', prompt: 'Does the identifying relationship get its own table?', options: ['Yes, always', 'No — the FK in the weak table represents it', 'Only if it is M:N', 'Only if it has attributes'], answer: 1, explain: 'It is 1:N towards the weak entity; the FK in the weak table already stores it.' },
        { type: 'text', prompt: 'Which referential action is used for the FK of a weak entity? (ON DELETE …)', keywords: [['cascade']], sample: 'ON DELETE CASCADE', explain: 'Deleting the owner deletes its dependent weak rows.' },
        { type: 'mcq', prompt: 'ORDER(OrderID) has weak ORDER_LINE(partial key LineNo, Qty). Correct table?', options: ['ORDER_LINE(LineNo PK, Qty)', 'ORDER_LINE(OrderID PK FK->ORDER, LineNo PK, Qty)', 'ORDER_LINE(OrderID FK->ORDER, LineNo, Qty PK)', 'ORDER(OrderID PK, LineNo, Qty)'], answer: 1, explain: 'Owner key + partial key as PK; OrderID is also an FK.' },
        { type: 'mcq', prompt: 'In a weak entity table, the owner\'s key column is…', options: ['only a PK column', 'only an FK column', 'both part of the PK and an FK', 'not included'], answer: 2, explain: 'It identifies the row (part of PK) and points to the owner (FK).' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm2l3',
      title: 'Relationships: 1:N, 1:1 and M:N',
      minutes: 25,
      intuition: `<p>A foreign key is like writing "my department is #3" on an employee's card. A card has room for <b>one</b> value, so the FK must go on the side where each row points to <b>at most one</b> other row — the <b>N side</b> of a 1:N. When both sides are "many" (M:N) no card has room, so we create a <b>separate table of pairs</b>, like an attendance list.</p>`,
      formal: `<ul>
<li><b>1:N</b> → put the PK of the "1" side as an <b>FK in the N-side table</b>. Relationship attributes go there too.</li>
<li><b>1:1</b> → put the FK on the side with <b>total participation</b> (no NULLs), and mark it <b>UNIQUE</b> (so it stays 1:1). Relationship attributes go with the FK. (If both are partial: either side; if both total: either side, or merge.)</li>
<li><b>M:N</b> → <b>new table</b> with the PKs of both entities as FKs; <b>PK = both keys</b>. Relationship attributes go in this table. If the same pair can occur several times (e.g. on different dates), add the date to the PK.</li>
<li><b>Recursive 1:N</b> (SUPERVISES) → FK to the same table (SupervisorID FK->EMPLOYEE).</li>
<li><b>N-ary (ternary)</b> → new table with all participating keys as FKs.</li>
</ul>`,
      worked: {
        problem: `<p>Map the company ERD: WORKS_FOR (DEPARTMENT 1:N EMPLOYEE, employee total), MANAGES (1:1, department total, attribute StartDate), WORKS_ON (EMPLOYEE M:N PROJECT, attribute Hours).</p>`,
        erd: `ENTITY EMPLOYEE: *EmpID, Name
ENTITY DEPARTMENT: *DeptID, DeptName
ENTITY PROJECT: *ProjID, ProjName
REL WORKS_FOR: DEPARTMENT 1, EMPLOYEE N total
REL MANAGES: EMPLOYEE 1, DEPARTMENT 1 total | StartDate
REL WORKS_ON: EMPLOYEE M, PROJECT N | Hours`,
        steps: [
          `Start with the strong entities: EMPLOYEE(EmpID PK, Name), DEPARTMENT(DeptID PK, DeptName), PROJECT(ProjID PK, ProjName).`,
          `<b>WORKS_FOR 1:N</b> → FK DeptID goes into EMPLOYEE (the N side): <code>EMPLOYEE(EmpID PK, Name, DeptID FK->DEPARTMENT)</code>.`,
          `<b>MANAGES 1:1</b> → DEPARTMENT has total participation (every department has a manager), so the FK goes into DEPARTMENT, marked UNIQUE, together with StartDate: <code>DEPARTMENT(DeptID PK, DeptName, MgrID FK->EMPLOYEE UNIQUE, MgrStartDate)</code>. Putting it in EMPLOYEE would give NULL for every non-manager.`,
          `<b>WORKS_ON M:N</b> → new table <code>WORKS_ON(EmpID PK FK->EMPLOYEE, ProjID PK FK->PROJECT, Hours)</code>.`
        ]
      },
      exercises: [
        {
          id: 'm2l3e1', type: 'mcq', level: 1, tags: ['fk-wrong-side-1toN'],
          prompt: `PUBLISHER 1 : N BOOK. Where does the foreign key go?`,
          options: ['PublisherID in BOOK', 'ISBN in PUBLISHER', 'A new table PUBLISHES', 'Both tables'], answer: 0,
          hints: ['Which side is "N"? Each book points to how many publishers?'],
          solution: `FK on the <b>N side</b>: BOOK gets PublisherID FK->PUBLISHER. A publisher row could not hold many ISBNs in one column.`
        },
        {
          id: 'm2l3e2', type: 'schema', level: 2, tags: ['mn-not-table', 'fk-wrong-side-1toN', 'rel-attr-misplaced'],
          prompt: `Map to tables.`,
          erd: `ENTITY STUDENT: *StudentID, Name
ENTITY COURSE: *CourseCode, Title
ENTITY PROFESSOR: *ProfID, Name
REL ENROLLS: STUDENT M, COURSE N | Grade
REL TEACHES: PROFESSOR 1, COURSE N total`,
          model: `STUDENT(StudentID PK, Name)
PROFESSOR(ProfID PK, Name)
COURSE(CourseCode PK, Title, ProfID FK->PROFESSOR)
ENROLLS(StudentID PK FK->STUDENT, CourseCode PK FK->COURSE, Grade)`,
          notes: { kinds: { ENROLLS: 'mn' } },
          aliases: { ENROLLS: ['ENROLLMENT', 'ENROLL', 'STUDENT_COURSE', 'TAKES'] },
          hints: ['TEACHES is 1:N → FK in COURSE.', 'ENROLLS is M:N → new table; Grade goes in it.'],
          solution: `<code>COURSE(CourseCode PK, Title, ProfID FK->PROFESSOR)</code> (1:N, FK on N side) and <code>ENROLLS(StudentID PK FK->STUDENT, CourseCode PK FK->COURSE, Grade)</code> (M:N table, Grade inside).`
        },
        {
          id: 'm2l3e3', type: 'schema', level: 3, tags: ['fk-wrong-side-1to1', 'fk-wrong-side-1toN'],
          prompt: `Two relationships between the same entities! Each CITY is in exactly one COUNTRY (a country has many cities). Each COUNTRY has exactly one capital CITY, and a city is the capital of at most one country.`,
          erd: `ENTITY COUNTRY: *CountryCode, Name
ENTITY CITY: *CityID, Name, Population
REL LOCATED_IN: COUNTRY 1, CITY N total
REL CAPITAL_OF: CITY 1, COUNTRY 1 total`,
          model: `COUNTRY(CountryCode PK, Name, CapitalCityID FK->CITY UNIQUE)
CITY(CityID PK, Name, Population, CountryCode FK->COUNTRY)`,
          notes: { kinds: { COUNTRY: '1:1' } },
          aliases: { CapitalCityID: ['CapitalID', 'Capital', 'CapitalCity'] },
          hints: ['LOCATED_IN is 1:N → FK in CITY.', 'CAPITAL_OF is 1:1. Which side has total participation? Every country has a capital, but most cities are not capitals.', 'Mark the 1:1 FK as UNIQUE.'],
          solution: `<code>CITY(CityID PK, Name, Population, CountryCode FK->COUNTRY)</code> — 1:N.<br><code>COUNTRY(CountryCode PK, Name, CapitalCityID FK->CITY UNIQUE)</code> — 1:1, FK on the total side (COUNTRY), UNIQUE so no city is the capital of two countries.`
        },
        {
          id: 'm2l3e4', type: 'mcq', level: 4, tags: ['mn-key'],
          prompt: `DOCTOR M:N PATIENT via TREATS(TreatDate, Diagnosis). The same doctor may treat the same patient several times on different days. Best PK for TREATS?`,
          options: ['(DoctorID, PatientID)', '(DoctorID, PatientID, TreatDate)', 'TreatDate', 'PatientID'], answer: 1,
          hints: ['With PK (DoctorID, PatientID), could you store a second visit?'],
          solution: `(DoctorID, PatientID) would allow only one row per pair. Since pairs repeat on different dates, the PK must be <b>(DoctorID, PatientID, TreatDate)</b>.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'In a 1:N relationship the FK goes…', options: ['in the 1-side table', 'in the N-side table', 'in a new table', 'in both tables'], answer: 1, explain: 'Each N-side row refers to exactly one 1-side row.' },
        { type: 'mcq', prompt: 'In a 1:1 relationship with one total side, the FK goes…', options: ['on the partial side', 'on the total side, marked UNIQUE', 'in a new table', 'nowhere'], answer: 1, explain: 'Total side → no NULLs. UNIQUE keeps it 1:1.' },
        { type: 'mcq', prompt: 'An M:N relationship becomes…', options: ['an FK on the M side', 'an FK on the N side', 'a new table whose PK includes both FKs', 'nothing'], answer: 2, explain: 'Pairs need their own table.' },
        { type: 'text', prompt: 'Why do we mark the FK of a 1:1 relationship as UNIQUE? (short)', keywords: [['once', 'only one', 'twice', 'repeat', 'duplicate', '1:1', 'one to one', 'one-to-one', 'at most one']], sample: 'So that each value appears only once — otherwise it would become 1:N.', explain: 'Without UNIQUE, two rows could point to the same row → 1:N.' },
        { type: 'mcq', prompt: 'Relationship attributes of a 1:N relationship go…', options: ['in the N-side table, next to the FK', 'in the 1-side table', 'in a new table', 'they are dropped'], answer: 0, explain: 'They travel with the FK.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm2l4',
      title: 'Case study: Metro Bus company (ERD → schema)',
      minutes: 35,
      intuition: `<p>Now we put everything together, exactly like in the exam: first <b>understand the story</b>, then <b>draw the ERD</b>, then <b>map it</b> rule by rule. Go slowly and tick every rectangle, oval and diamond as you map it — nothing may be forgotten.</p>`,
      formal: `<p><b>The Metro Bus story.</b> The company runs bus <b>LINEs</b> (line number, name, color). A line serves many <b>STOPs</b> (stop ID, name, zone) in a fixed order, and a stop can be served by many lines; we store the order of each stop on each line. The company owns <b>BUSes</b> (bus ID, plate, capacity, model) and employs <b>DRIVERs</b> (driver ID, name first+last, hire date, years of service — computed, several phone numbers). A <b>TRIP</b> (trip ID, date, departure time) runs on exactly one line, uses exactly one bus and is driven by exactly one driver. Each bus has <b>MAINTENANCE</b> records numbered 1, 2, 3 … per bus (service date, cost).</p>
<p><b>Mapping checklist:</b> strong entities → composite → derived → multivalued → weak → 1:N → 1:1 → M:N.</p>`,
      worked: {
        problem: `<p>Draw the ERD of the Metro Bus story, then map it to a relational schema.</p>`,
        erd: `ENTITY LINE: *LineNo, LineName, Color
ENTITY STOP: *StopID, StopName, Zone
ENTITY BUS: *BusID, Plate, Capacity, Model
ENTITY DRIVER: *DriverID, Name(FirstName, LastName), HireDate, /YearsOfService, [Phone]
ENTITY TRIP: *TripID, TripDate, DepartTime
WEAK MAINTENANCE: ~RecordNo, ServiceDate, Cost
REL SERVES: LINE M total, STOP N | StopOrder
REL ON_LINE: LINE 1, TRIP N total
REL USES: BUS 1, TRIP N total
REL DRIVES: DRIVER 1, TRIP N total
IDREL HAS_RECORD: BUS 1, MAINTENANCE N total`,
        steps: [
          `<b>ERD.</b> Entities: LINE, STOP, BUS, DRIVER, TRIP (strong) and MAINTENANCE (weak, partial key RecordNo). SERVES is M:N with StopOrder. TRIP is N:1 to LINE, BUS and DRIVER, with total participation of TRIP ("exactly one"). The diagram is below.`,
          `<b>Strong entities:</b> <code>LINE(LineNo PK, LineName, Color)</code>, <code>STOP(StopID PK, StopName, Zone)</code>, <code>BUS(BusID PK, Plate, Capacity, Model)</code>.`,
          `<b>DRIVER:</b> Name is composite → FirstName, LastName. YearsOfService is derived → dropped. Phone is multivalued → own table:<br><code>DRIVER(DriverID PK, FirstName, LastName, HireDate)</code><br><code>DRIVER_PHONE(DriverID PK FK->DRIVER, Phone PK)</code>`,
          `<b>Weak MAINTENANCE:</b> <code>MAINTENANCE(BusID PK FK->BUS, RecordNo PK, ServiceDate, Cost)</code> (ON DELETE CASCADE).`,
          `<b>1:N relationships</b> ON_LINE, USES, DRIVES all have TRIP on the N side → three FKs in TRIP:<br><code>TRIP(TripID PK, TripDate, DepartTime, LineNo FK->LINE, BusID FK->BUS, DriverID FK->DRIVER)</code>`,
          `<b>M:N SERVES</b> → new table with StopOrder: <code>LINE_STOP(LineNo PK FK->LINE, StopID PK FK->STOP, StopOrder)</code>. (A line visits a stop once, so (LineNo, StopID) is enough. Bonus: (LineNo, StopOrder) is also unique — a candidate key.)`,
          `<b>Assumptions</b> we made: a line passes each stop only once; a trip uses one bus for the whole trip; phone numbers are not shared between drivers. You can try every query on these tables in Module 3!`
        ]
      },
      exercises: [
        {
          id: 'm2l4e1', type: 'erd', level: 3, tags: ['cardinality', 'participation', 'weak-entity-notation', 'rel-attr-misplaced'],
          prompt: `Without looking at the worked example, build the Metro Bus ERD from the story above (LINE, STOP, BUS, DRIVER, TRIP, MAINTENANCE).`,
          model: `ENTITY LINE: *LineNo, LineName, Color
ENTITY STOP: *StopID, StopName, Zone
ENTITY BUS: *BusID, Plate, Capacity, Model
ENTITY DRIVER: *DriverID, Name(FirstName, LastName), HireDate, /YearsOfService, [Phone]
ENTITY TRIP: *TripID, TripDate, DepartTime
WEAK MAINTENANCE: ~RecordNo, ServiceDate, Cost
REL SERVES: LINE M ?, STOP N ? | StopOrder
REL ON_LINE: LINE 1 ?, TRIP N total
REL USES: BUS 1 ?, TRIP N total
REL DRIVES: DRIVER 1 ?, TRIP N total
IDREL HAS_RECORD: BUS 1 ?, MAINTENANCE N total`,
          aliases: { LineNo: ['LineNumber', 'LineID'], SERVES: ['LINE_STOP', 'STOPS_AT', 'HAS_STOP', 'ROUTE'], StopOrder: ['Order', 'Sequence', 'SeqNo', 'Position'], ON_LINE: ['RUNS_ON', 'FOLLOWS', 'BELONGS_TO', 'OF_LINE'], USES: ['USE', 'ASSIGNED', 'OPERATED_BY'], DRIVES: ['DRIVEN_BY', 'DRIVE', 'OPERATES'], HAS_RECORD: ['HAS', 'HAS_MAINTENANCE', 'MAINTAINED'], RecordNo: ['RecordNumber', 'RecordID'], DepartTime: ['DepartureTime', 'Departure', 'Time'], TripDate: ['Date'] },
          hints: ['Start with the 5 strong entities and their keys.', 'TRIP connects to LINE, BUS and DRIVER with three 1:N relationships (TRIP on the N side, total).', 'StopOrder belongs on SERVES (M:N).', 'MAINTENANCE is weak (RecordNo restarts for each bus).'],
          solution: `See the worked example diagram: 6 entities (MAINTENANCE weak), SERVES M:N with StopOrder, three 1:N relationships to TRIP (TRIP total), identifying HAS_RECORD.`
        },
        {
          id: 'm2l4e2', type: 'schema', level: 4, tags: ['mn-not-table', 'weak-entity-key', 'multivalued-not-split', 'fk-wrong-side-1toN'],
          prompt: `Map the Metro Bus ERD (shown) to a relational schema.`,
          erd: `ENTITY LINE: *LineNo, LineName, Color
ENTITY STOP: *StopID, StopName, Zone
ENTITY BUS: *BusID, Plate, Capacity, Model
ENTITY DRIVER: *DriverID, Name(FirstName, LastName), HireDate, /YearsOfService, [Phone]
ENTITY TRIP: *TripID, TripDate, DepartTime
WEAK MAINTENANCE: ~RecordNo, ServiceDate, Cost
REL SERVES: LINE M total, STOP N | StopOrder
REL ON_LINE: LINE 1, TRIP N total
REL USES: BUS 1, TRIP N total
REL DRIVES: DRIVER 1, TRIP N total
IDREL HAS_RECORD: BUS 1, MAINTENANCE N total`,
          model: `LINE(LineNo PK, LineName, Color)
STOP(StopID PK, StopName, Zone)
LINE_STOP(LineNo PK FK->LINE, StopID PK FK->STOP, StopOrder)
BUS(BusID PK, Plate, Capacity, Model)
DRIVER(DriverID PK, FirstName, LastName, HireDate)
DRIVER_PHONE(DriverID PK FK->DRIVER, Phone PK)
TRIP(TripID PK, TripDate, DepartTime, LineNo FK->LINE, BusID FK->BUS, DriverID FK->DRIVER)
MAINTENANCE(BusID PK FK->BUS, RecordNo PK, ServiceDate, Cost)`,
          notes: { kinds: { LINE_STOP: 'mn', DRIVER_PHONE: 'multi', MAINTENANCE: 'weak' }, composite: { Name: ['FirstName', 'LastName'] }, derived: ['YearsOfService'], multivalued: { Phone: 'DRIVER_PHONE' } },
          aliases: { LINE_STOP: ['SERVES', 'LINESTOP', 'ROUTE_STOP', 'STOPS_AT'], DRIVER_PHONE: ['PHONE'], LineNo: ['LineNumber', 'LineID'], RecordNo: ['RecordNumber'] },
          hints: ['8 tables.', 'TRIP gets three FKs.', 'SERVES becomes LINE_STOP with StopOrder.'],
          solution: `<code>LINE(LineNo PK, LineName, Color)</code><br><code>STOP(StopID PK, StopName, Zone)</code><br><code>LINE_STOP(LineNo PK FK->LINE, StopID PK FK->STOP, StopOrder)</code><br><code>BUS(BusID PK, Plate, Capacity, Model)</code><br><code>DRIVER(DriverID PK, FirstName, LastName, HireDate)</code><br><code>DRIVER_PHONE(DriverID PK FK->DRIVER, Phone PK)</code><br><code>TRIP(TripID PK, TripDate, DepartTime, LineNo FK->LINE, BusID FK->BUS, DriverID FK->DRIVER)</code><br><code>MAINTENANCE(BusID PK FK->BUS, RecordNo PK, ServiceDate, Cost)</code>`
        },
        {
          id: 'm2l4e3', type: 'schema', level: 5, exam: true, tags: ['fk-wrong-side-1to1', 'weak-entity-key', 'multivalued-not-split', 'composite-not-split', 'mn-not-table', 'mn-key'],
          prompt: `<b>Hospital (exam style).</b> DEPARTMENT(DeptID, DeptName, Location); DOCTOR(DoctorID, Name first+last, Salary, multivalued Phone, multivalued Specialty); PATIENT(PatientID, Name first+last, DOB, Address street/city/ZIP); weak EMERGENCY_CONTACT(partial key ContactName, Phone, Relationship) owned by PATIENT; HEADS 1:1 (every department has exactly one head doctor, attribute HeadSince); WORKS_IN DEPARTMENT 1:N DOCTOR (every doctor in exactly one department); TREATS DOCTOR M:N PATIENT with TreatDate and Diagnosis.<br>Task (a): write the relational schema with PKs and FKs. (Tasks b and c — explanations and assumptions — are in the solution and in exam mode.)`,
          erd: `ENTITY DEPARTMENT: *DeptID, DeptName, Location
ENTITY DOCTOR: *DoctorID, Name(FirstName, LastName), Salary, [Phone], [Specialty]
ENTITY PATIENT: *PatientID, Name(FirstName, LastName), DOB, Address(Street, City, ZIP)
WEAK EMERGENCY_CONTACT: ~ContactName, Phone, Relationship
IDREL HAS_CONTACT: PATIENT 1, EMERGENCY_CONTACT N total
REL HEADS: DOCTOR 1, DEPARTMENT 1 total | HeadSince
REL WORKS_IN: DEPARTMENT 1, DOCTOR N total
REL TREATS: DOCTOR M, PATIENT N | TreatDate, Diagnosis`,
          model: [`DEPARTMENT(DeptID PK, DeptName, Location, HeadDoctorID FK->DOCTOR UNIQUE, HeadSince)
DOCTOR(DoctorID PK, FirstName, LastName, Salary, DeptID FK->DEPARTMENT)
DOCTOR_PHONE(DoctorID PK FK->DOCTOR, Phone PK)
DOCTOR_SPECIALTY(DoctorID PK FK->DOCTOR, Specialty PK)
PATIENT(PatientID PK, FirstName, LastName, DOB, Street, City, ZIP)
EMERGENCY_CONTACT(PatientID PK FK->PATIENT, ContactName PK, Phone, Relationship)
TREATS(DoctorID PK FK->DOCTOR, PatientID PK FK->PATIENT, TreatDate PK, Diagnosis)`,
          `DEPARTMENT(DeptID PK, DeptName, Location, HeadDoctorID FK->DOCTOR UNIQUE, HeadSince)
DOCTOR(DoctorID PK, FirstName, LastName, Salary, DeptID FK->DEPARTMENT)
DOCTOR_PHONE(DoctorID PK FK->DOCTOR, Phone PK)
DOCTOR_SPECIALTY(DoctorID PK FK->DOCTOR, Specialty PK)
PATIENT(PatientID PK, FirstName, LastName, DOB, Street, City, ZIP)
EMERGENCY_CONTACT(PatientID PK FK->PATIENT, ContactName PK, Phone, Relationship)
TREATS(DoctorID PK FK->DOCTOR, PatientID PK FK->PATIENT, TreatDate, Diagnosis)`],
          notes: { kinds: { DOCTOR_PHONE: 'multi', DOCTOR_SPECIALTY: 'multi', EMERGENCY_CONTACT: 'weak', TREATS: 'mn', DEPARTMENT: '1:1' }, composite: { Name: ['FirstName', 'LastName'], Address: ['Street', 'City', 'ZIP'] }, multivalued: { Phone: 'DOCTOR_PHONE', Specialty: 'DOCTOR_SPECIALTY' } },
          aliases: { HeadDoctorID: ['HeadID', 'HeadDocID', 'HeadDoctor', 'Head', 'HeadOfDept', 'ManagerID'], DOCTOR_SPECIALTY: ['SPECIALTY', 'DOCTOR_SPECIALITY', 'DOCTOR_SPECIALTIES', 'SPECIALITY'], DOCTOR_PHONE: ['PHONE', 'DOCTORPHONES'], EMERGENCY_CONTACT: ['CONTACT', 'EMERGENCYCONTACTS'], TREATS: ['TREATMENT', 'TREAT', 'TREATED_BY'], Relationship: ['Relation', 'RelationType'] },
          explainKeywords: [['composite', 'split'], ['multivalued', 'multi-valued', 'own table', 'separate table'], ['weak', 'partial key', 'cascade'], ['1:1', 'one-to-one', 'unique', 'total participation'], ['1:n', '1:m', 'one-to-many', 'n side', 'many side'], ['m:n', 'many-to-many', 'both keys', 'junction', 'bridge', 'associative']],
          hints: ['7 tables: 3 strong, 2 multivalued, 1 weak, 1 M:N.', 'HEADS is 1:1: which side is total? Put the FK + HeadSince there, UNIQUE.', 'WORKS_IN 1:N → DeptID in DOCTOR.'],
          solution: `<b>(a) Schema</b><br><code>DEPARTMENT(DeptID PK, DeptName, Location, HeadDoctorID FK->DOCTOR UNIQUE, HeadSince)</code><br><code>DOCTOR(DoctorID PK, FirstName, LastName, Salary, DeptID FK->DEPARTMENT)</code><br><code>DOCTOR_PHONE(DoctorID PK FK->DOCTOR, Phone PK)</code><br><code>DOCTOR_SPECIALTY(DoctorID PK FK->DOCTOR, Specialty PK)</code><br><code>PATIENT(PatientID PK, FirstName, LastName, DOB, Street, City, ZIP)</code><br><code>EMERGENCY_CONTACT(PatientID PK FK->PATIENT, ContactName PK, Phone, Relationship)</code><br><code>TREATS(DoctorID PK FK->DOCTOR, PatientID PK FK->PATIENT, TreatDate PK, Diagnosis)</code>
<p><b>(b) Mapping explanation.</b> Strong entities become tables with their keys as PK. Composite Name/Address are split into simple columns. Multivalued Phone and Specialty get their own tables (DoctorID, value) with both columns as PK. The weak EMERGENCY_CONTACT takes the owner's PK PatientID as FK; PK = PatientID + ContactName; ON DELETE CASCADE. HEADS is 1:1 with total participation of DEPARTMENT, so the FK HeadDoctorID (UNIQUE) and HeadSince go into DEPARTMENT. WORKS_IN is 1:N, so DeptID goes into DOCTOR (the N side), NOT NULL because participation is total. TREATS is M:N → its own table with both keys and the attributes TreatDate and Diagnosis.</p>
<p><b>(c) Assumptions.</b> A doctor may treat the same patient on different dates, so TreatDate is part of the PK (if a pair could occur only once, PK = DoctorID + PatientID). A doctor heads at most one department (UNIQUE). DOCTOR.DeptID and DEPARTMENT.HeadDoctorID reference each other — create the tables first, then add one FK with ALTER TABLE (or allow NULL temporarily).</p>`
        },
        {
          id: 'm2l4e4', type: 'text', level: 4, tags: ['fk-wrong-side-1to1'],
          prompt: `In the Hospital case, a classmate put <code>HeadOfDeptID FK->DEPARTMENT</code> into DOCTOR instead. Give one problem with that choice.`,
          keywords: [['null', 'empty', 'most doctors', 'not every doctor', 'many doctors', 'partial', 'waste']],
          sample: 'Most doctors are not heads, so the column would be NULL for almost every doctor (DOCTOR has partial participation). DEPARTMENT has total participation, so the FK belongs there.',
          hints: ['How many doctors are heads? What value would the column have for the others?'],
          solution: `Only a few doctors are heads, so <b>HeadOfDeptID would be NULL for most doctors</b> (partial participation). Every department has a head (total participation), so placing the FK in DEPARTMENT gives no NULLs — and HeadSince fits there too.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'TRIP is N:1 to LINE, BUS and DRIVER. How many foreign keys does TRIP get?', options: ['0', '1', '3', 'TRIP becomes an M:N table'], answer: 2, explain: 'Each 1:N relationship adds one FK on the N side → LineNo, BusID, DriverID.' },
        { type: 'mcq', prompt: 'Where does StopOrder go?', options: ['STOP', 'LINE', 'LINE_STOP', 'TRIP'], answer: 2, explain: 'The order of a stop depends on the line → attribute of the M:N relationship table.' },
        { type: 'mcq', prompt: 'Which of these is NOT stored in the Metro schema?', options: ['HireDate', 'YearsOfService', 'Capacity', 'Zone'], answer: 1, explain: 'YearsOfService is derived from HireDate.' },
        { type: 'text', prompt: 'Primary key of MAINTENANCE(BusID, RecordNo, ServiceDate, Cost)?', keywords: [['busid'], ['recordno', 'recordnumber']], sample: '(BusID, RecordNo)', explain: 'Weak entity: owner key + partial key.' },
        { type: 'mcq', prompt: 'Why is writing assumptions useful in an exam mapping question?', options: ['It is not useful', 'It justifies choices where the story is ambiguous (e.g. can a pair repeat?)', 'It replaces the schema', 'It makes the schema longer'], answer: 1, explain: 'Examiners accept different keys if you state and justify your assumption.' }
      ]
    }
  ],
  review: {
    definitions: [
      ['Primary key (PK)', 'Column(s) that uniquely identify each row.'],
      ['Foreign key (FK)', 'Column(s) referencing the PK of another (or the same) table.'],
      ['UNIQUE', 'No two rows have the same value; used on the FK of a 1:1.'],
      ['ON DELETE CASCADE', 'Deleting the parent row deletes child rows (used for weak entities).']
    ],
    rules: [
      'Strong entity → table, key → PK.',
      'Composite → only its simple parts. Derived → not stored.',
      'Multivalued → new table (OwnerKey FK, Value), PK = both.',
      'Weak → table with owner PK (FK) + partial key; PK = both; ON DELETE CASCADE.',
      '1:N → FK in the N-side table (+ relationship attributes).',
      '1:1 → FK on the total-participation side, UNIQUE (+ relationship attributes).',
      'M:N → new table, PK = both FKs (+ date if pairs repeat), relationship attributes inside.'
    ],
    traps: [
      'Putting the FK on the 1 side of a 1:N.',
      'Forgetting UNIQUE on the 1:1 FK.',
      'Weak entity table with only the partial key as PK.',
      'Storing Age / YearsOfService / TotalAmount.',
      'Keeping a column Phone in DOCTOR for a multivalued attribute.'
    ],
    example: `<p><code>EMPLOYEE(EmpID PK, Name, DeptID FK->DEPARTMENT)</code><br><code>DEPARTMENT(DeptID PK, DeptName, MgrID FK->EMPLOYEE UNIQUE, MgrStartDate)</code><br><code>WORKS_ON(EmpID PK FK->EMPLOYEE, ProjID PK FK->PROJECT, Hours)</code><br><code>DEPENDENT(EmpID PK FK->EMPLOYEE, DepName PK, BirthDate)</code></p>`
  }
});
