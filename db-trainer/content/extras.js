/* =====================================================================
   FLASHCARDS and MOCK EXAMS
   Flashcard: { id, module, front, back, sym?: symbol shown on the front, symBack?: symbol on the back }
   Symbols: entity weak rel idrel attr key partial multi derived composite total partialp
   Exam question: an exercise object + points. Use { ref:'m1l4e3', points } to reuse an exercise.
   ===================================================================== */
CONTENT.flashcards = [
  // ---- Module 1
  { id: 'f-m1-1', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'entity', back: 'Entity type (strong entity) — rectangle.' },
  { id: 'f-m1-2', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'weak', back: 'Weak entity — double rectangle. Identified by owner key + partial key.' },
  { id: 'f-m1-3', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'rel', back: 'Relationship type — diamond.' },
  { id: 'f-m1-4', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'idrel', back: 'Identifying relationship (connects a weak entity to its owner) — double diamond.' },
  { id: 'f-m1-5', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'multi', back: 'Multivalued attribute — double oval.' },
  { id: 'f-m1-6', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'derived', back: 'Derived attribute — dashed oval (computed, e.g. Age).' },
  { id: 'f-m1-7', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'key', back: 'Key attribute — name underlined.' },
  { id: 'f-m1-8', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'partial', back: 'Partial key (discriminator) of a weak entity — dashed underline.' },
  { id: 'f-m1-9', module: 'm1', front: 'What does this Chen symbol mean?', sym: 'composite', back: 'Composite attribute — an oval with sub-ovals for its parts.' },
  { id: 'f-m1-10', module: 'm1', front: 'What does a double line between an entity and a relationship mean?', sym: 'total', back: 'Total participation: every instance of the entity must take part.' },
  { id: 'f-m1-11', module: 'm1', front: 'Which symbol is used for a multivalued attribute?', back: 'Double oval:', symBack: 'multi' },
  { id: 'f-m1-12', module: 'm1', front: 'Which symbol is used for a weak entity?', back: 'Double rectangle:', symBack: 'weak' },
  { id: 'f-m1-13', module: 'm1', front: 'Strong vs weak entity', back: 'Strong: has its own key. Weak: no own key; identified by owner\'s key + partial key; total participation in an identifying relationship.' },
  { id: 'f-m1-14', module: 'm1', front: 'Owner entity', back: 'The entity a weak entity depends on (also: identifying or parent entity).' },
  { id: 'f-m1-15', module: 'm1', front: 'Composite vs multivalued attribute', back: 'Composite = ONE value made of parts (Address: street, city). Multivalued = SEVERAL values (phones).' },
  { id: 'f-m1-16', module: 'm1', front: 'Degree of a relationship', back: 'Number of participating entity types: unary (recursive), binary, ternary.' },
  { id: 'f-m1-17', module: 'm1', front: 'Cardinality ratio', back: 'Maximum number of relationship instances an entity can participate in: 1:1, 1:N, M:N.' },
  { id: 'f-m1-18', module: 'm1', front: 'Participation constraint', back: 'Minimum: total (every entity participates, double line) or partial (single line).' },
  { id: 'f-m1-19', module: 'm1', front: 'Relationship attribute — example?', back: 'A fact about the pair, e.g. Grade on ENROLLS, Hours on WORKS_ON, LoanDate on BORROWS.' },
  { id: 'f-m1-20', module: 'm1', front: 'Recursive (unary) relationship', back: 'An entity type related to itself in two roles, e.g. EMPLOYEE supervises EMPLOYEE.' },
  // ---- Module 2
  { id: 'f-m2-1', module: 'm2', front: 'Mapping: strong entity', back: 'New table; key attribute becomes the PK.' },
  { id: 'f-m2-2', module: 'm2', front: 'Mapping: composite attribute', back: 'Only its simple parts become columns.' },
  { id: 'f-m2-3', module: 'm2', front: 'Mapping: derived attribute', back: 'Not stored.' },
  { id: 'f-m2-4', module: 'm2', front: 'Mapping: multivalued attribute', back: 'New table (OwnerKey FK, Value); PK = both columns.' },
  { id: 'f-m2-5', module: 'm2', front: 'Mapping: weak entity', back: 'Table with owner PK as FK + partial key; PK = owner key + partial key; ON DELETE CASCADE.' },
  { id: 'f-m2-6', module: 'm2', front: 'Mapping: 1:N relationship', back: 'FK in the N-side table (plus relationship attributes).' },
  { id: 'f-m2-7', module: 'm2', front: 'Mapping: 1:1 relationship', back: 'FK on the side with total participation, marked UNIQUE (plus relationship attributes).' },
  { id: 'f-m2-8', module: 'm2', front: 'Mapping: M:N relationship', back: 'New table with both PKs as FKs; PK = both keys (+ date if pairs repeat); relationship attributes inside.' },
  { id: 'f-m2-9', module: 'm2', front: 'Primary key vs foreign key', back: 'PK: identifies rows in its own table. FK: refers to the PK of another (or the same) table.' },
  { id: 'f-m2-10', module: 'm2', front: 'Why UNIQUE on a 1:1 FK?', back: 'Without it, two rows could reference the same row → it would be 1:N.' },
  { id: 'f-m2-11', module: 'm2', front: 'Why ON DELETE CASCADE for weak entities?', back: 'A weak entity cannot exist without its owner (existence dependency).' },
  { id: 'f-m2-12', module: 'm2', front: 'Mapping: ternary relationship', back: 'New table with the PKs of all three entities as FKs.' },
  // ---- Module 3
  { id: 'f-m3-1', module: 'm3', front: 'σ (selection)', back: 'Keeps rows that satisfy a condition. SELECT[cond](R) — SQL WHERE.' },
  { id: 'f-m3-2', module: 'm3', front: 'π (projection)', back: 'Keeps some columns and removes duplicates. PROJECT[a,b](R) — SQL SELECT DISTINCT.' },
  { id: 'f-m3-3', module: 'm3', front: 'ρ (rename)', back: 'Renames a relation and/or its attributes. RENAME[S(a,b)](R) — SQL AS.' },
  { id: 'f-m3-4', module: 'm3', front: 'Union compatibility', back: 'Same number of attributes, and corresponding attributes have the same domains.' },
  { id: 'f-m3-5', module: 'm3', front: 'Cartesian product R × S', back: 'Every row of R with every row of S: |R|·|S| rows.' },
  { id: 'f-m3-6', module: 'm3', front: 'Theta join', back: 'R ⋈θ S = σθ(R × S).' },
  { id: 'f-m3-7', module: 'm3', front: 'Equi join', back: 'A theta join whose condition uses only equality.' },
  { id: 'f-m3-8', module: 'm3', front: 'Natural join', back: 'Equi join on ALL attributes with the same name; keeps one copy of them.' },
  { id: 'f-m3-9', module: 'm3', front: 'Left outer join', back: 'Join + all unmatched rows of the LEFT relation padded with NULLs.' },
  { id: 'f-m3-10', module: 'm3', front: 'Division R ÷ S', back: 'X values of R that appear with EVERY row of S. For "all/every" questions.' },
  { id: 'f-m3-11', module: 'm3', front: 'Aggregation γ', back: 'GROUP[groupattrs; COUNT/SUM/AVG/MIN/MAX](R) — SQL GROUP BY.' },
  { id: 'f-m3-12', module: 'm3', front: 'WHERE vs HAVING', back: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.' },
  { id: 'f-m3-13', module: 'm3', front: 'Query tree', back: 'Leaves = relations, inner nodes = operations, root = result. Push σ and π down.' },
  { id: 'f-m3-14', module: 'm3', front: 'R − S in SQL', back: 'EXCEPT (Oracle: MINUS).' },
  // ---- Module 4
  { id: 'f-m4-1', module: 'm4', front: 'Functional dependency X → Y', back: 'Any two rows that agree on X also agree on Y.' },
  { id: 'f-m4-2', module: 'm4', front: 'Trivial FD', back: 'X → Y with Y ⊆ X.' },
  { id: 'f-m4-3', module: 'm4', front: 'Reflexivity', back: 'If Y ⊆ X then X → Y.' },
  { id: 'f-m4-4', module: 'm4', front: 'Augmentation', back: 'If X → Y then XZ → YZ.' },
  { id: 'f-m4-5', module: 'm4', front: 'Transitivity', back: 'If X → Y and Y → Z then X → Z.' },
  { id: 'f-m4-6', module: 'm4', front: 'Union rule', back: 'X → Y and X → Z ⟹ X → YZ.' },
  { id: 'f-m4-7', module: 'm4', front: 'Decomposition rule', back: 'X → YZ ⟹ X → Y and X → Z.' },
  { id: 'f-m4-8', module: 'm4', front: 'Pseudotransitivity', back: 'X → Y and WY → Z ⟹ WX → Z.' },
  { id: 'f-m4-9', module: 'm4', front: 'Attribute closure X+', back: 'Set of all attributes functionally determined by X (apply FDs until nothing changes).' },
  { id: 'f-m4-10', module: 'm4', front: 'Superkey vs candidate key', back: 'Superkey: X+ = all attributes. Candidate key: minimal superkey.' },
  { id: 'f-m4-11', module: 'm4', front: 'Prime attribute', back: 'An attribute that belongs to at least one candidate key.' },
  { id: 'f-m4-12', module: 'm4', front: 'Minimal cover', back: 'Equivalent FD set with single-attribute RHS, no extraneous LHS attributes, no redundant FDs.' },
  { id: 'f-m4-13', module: 'm4', front: '1NF', back: 'All attribute values are atomic (no repeating groups or lists).' },
  { id: 'f-m4-14', module: 'm4', front: '2NF', back: '1NF and no non-prime attribute is partially dependent on a candidate key.' },
  { id: 'f-m4-15', module: 'm4', front: '3NF', back: 'For every non-trivial X → A: X is a superkey or A is prime (no transitive dependencies).' },
  { id: 'f-m4-16', module: 'm4', front: 'BCNF', back: 'For every non-trivial X → A: X is a superkey.' },
  { id: 'f-m4-17', module: 'm4', front: 'Insertion / update / deletion anomaly', back: 'Cannot insert a fact without another / must change many copies / deleting a row loses another fact.' },
  { id: 'f-m4-18', module: 'm4', front: 'Lossless join (binary test)', back: 'R1 ∩ R2 → R1 or R1 ∩ R2 → R2.' },
  { id: 'f-m4-19', module: 'm4', front: 'Dependency preservation', back: 'The union of the FDs projected on the pieces implies all original FDs.' },
  { id: 'f-m4-20', module: 'm4', front: '3NF vs BCNF decomposition', back: '3NF: always lossless AND dependency preserving. BCNF: always lossless, maybe not preserving.' }
];

CONTENT.exams = [
  {
    id: 'examA',
    title: 'Mock exam A — Library & Hospital',
    minutes: 90,
    sections: [
      { title: '1. Scenario → ERD', questions: [{ ref: 'm1l4e3', points: 25 }] },
      {
        title: '2. ERD → Relational schema', questions: [
          { ref: 'm2l4e3', points: 20 },
          {
            id: 'examA-explain', type: 'explain', points: 5,
            prompt: `Hospital (b) + (c): <b>explain each mapping</b> you used (composite, multivalued, weak entity, 1:1, 1:N, M:N) and <b>state your assumptions</b>.`,
            keywords: [['composite', 'split'], ['multivalued', 'multi-valued', 'own table', 'separate table'], ['weak', 'partial key', 'cascade'], ['1:1', 'one-to-one', 'one to one', 'unique', 'total participation'], ['1:n', 'one-to-many', 'one to many', 'n side', 'many side'], ['m:n', 'many-to-many', 'many to many', 'both keys', 'junction', 'bridge'], ['assum']],
            sample: `See the solution of the Hospital exercise: strong → table; composite split; multivalued → own table with PK (owner, value); weak → owner PK + partial key, ON DELETE CASCADE; 1:1 HEADS → FK in DEPARTMENT (total side) UNIQUE + HeadSince; 1:N WORKS_IN → DeptID in DOCTOR; M:N TREATS → own table, PK includes TreatDate (assumption: same doctor–patient pair can repeat on other dates).`
          }
        ]
      },
      {
        title: '3. Relational algebra / SQL', questions: [
          {
            id: 'examA-q1', type: 'query', points: 8,
            prompt: `Names of employees who work in a department located in <b>Berlin</b> and earn more than 1000.`,
            ra: `PROJECT[name](SELECT[salary>1000](EMPLOYEE) JOIN[EMPLOYEE.deptid=DEPARTMENT.deptid] SELECT[location='Berlin'](DEPARTMENT))`,
            sql: `SELECT DISTINCT e.name FROM EMPLOYEE e JOIN DEPARTMENT d ON e.deptid = d.deptid WHERE d.location = 'Berlin' AND e.salary > 1000;`,
            tags: ['join-condition', 'selection-projection']
          },
          {
            id: 'examA-q2', type: 'query', points: 8,
            prompt: `Metro Bus: <b>stop names</b> served by <b>both</b> line 1 and line 2.`,
            ra: `PROJECT[stopname]((PROJECT[stopid](SELECT[lineno=1](LINE_STOP)) INTERSECT PROJECT[stopid](SELECT[lineno=2](LINE_STOP))) NATURALJOIN STOP)`,
            sql: `SELECT s.stopname FROM STOP s WHERE s.stopid IN (SELECT stopid FROM LINE_STOP WHERE lineno = 1) AND s.stopid IN (SELECT stopid FROM LINE_STOP WHERE lineno = 2);`,
            tags: ['set-ops', 'join-condition']
          },
          {
            id: 'examA-q3', type: 'query', points: 9,
            prompt: `Metro Bus: for each <b>line name</b> with <b>more than 2 trips</b>, give the line name and its number of trips.`,
            ra: `SELECT[n>2](GROUP[linename; COUNT(*) AS n](LINE NATURALJOIN TRIP))`,
            sql: `SELECT l.linename, COUNT(*) AS n FROM LINE l JOIN TRIP t ON l.lineno = t.lineno GROUP BY l.linename HAVING COUNT(*) > 2;`,
            tags: ['aggregation']
          }
        ]
      },
      {
        title: '4. Normalization', intro: `R(A,B,C,D,E) with F = {AB → C, C → D, B → E}.`, questions: [
          { id: 'examA-n1', type: 'fd', ask: 'keys', points: 8, prompt: 'Find all candidate keys of R.', problem: 'R(A,B,C,D,E)\nAB->C\nC->D\nB->E', tags: ['candidate-key'] },
          { id: 'examA-n2', type: 'fd', ask: 'nf', points: 7, prompt: 'What is the highest normal form of R?', problem: 'R(A,B,C,D,E)\nAB->C\nC->D\nB->E', tags: ['partial-dependency'] },
          { id: 'examA-n3', type: 'fd', ask: 'decomp3nf', points: 10, prompt: 'Decompose R into 3NF (lossless and dependency preserving).', problem: 'R(A,B,C,D,E)\nAB->C\nC->D\nB->E', tags: ['decomposition'] }
        ]
      }
    ]
  },
  {
    id: 'examB',
    title: 'Mock exam B — Online courses & University',
    minutes: 90,
    sections: [
      {
        title: '1. Scenario → ERD', questions: [{
          id: 'examB-erd', type: 'erd', points: 25, tags: ['weak-entity-notation', 'cardinality', 'participation', 'rel-attr-misplaced', 'multivalued-notation', 'derived-notation'],
          prompt: `An online course platform stores INSTRUCTORs (instructor ID, name first+last, several emails). Each COURSE (course ID, title, price, number of lessons — computed) is created by exactly one instructor; an instructor creates many courses. A course consists of LESSONs numbered 1, 2, 3 … within the course (lesson number, title, duration). STUDENTs (student ID, name, country) enroll in many courses and a course has many students; for each enrollment we store the enroll date and the progress (%). Every student has exactly one ACCOUNT (username, created on), and every account belongs to exactly one student. Draw the ERD.`,
          model: `ENTITY INSTRUCTOR: *InstructorID, Name(FirstName, LastName), [Email]
ENTITY COURSE: *CourseID, Title, Price, /NumLessons
WEAK LESSON: ~LessonNo, Title, Duration
ENTITY STUDENT: *StudentID, Name, Country
ENTITY ACCOUNT: *Username, CreatedOn
REL CREATES: INSTRUCTOR 1 ?, COURSE N total
IDREL HAS_LESSON: COURSE 1 ?, LESSON N total
REL ENROLLS: STUDENT M ?, COURSE N ? | EnrollDate, Progress
REL HAS_ACCOUNT: STUDENT 1 total, ACCOUNT 1 total`,
          aliases: { NumLessons: ['NumberOfLessons', 'LessonCount', 'NoOfLessons'], LessonNo: ['LessonNumber'], CREATES: ['CREATE', 'TEACHES', 'CREATED_BY', 'OFFERS'], HAS_LESSON: ['HAS', 'CONTAINS', 'CONSISTS_OF'], ENROLLS: ['ENROLL', 'ENROLLMENT', 'TAKES'], HAS_ACCOUNT: ['HAS', 'OWNS'], CreatedOn: ['CreationDate', 'Created', 'CreatedDate'], Username: ['UserName', 'Login'] }
        }]
      },
      {
        title: '2. ERD → Relational schema', questions: [
          {
            id: 'examB-schema', type: 'schema', points: 20, tags: ['fk-wrong-side-1to1', 'weak-entity-key', 'mn-not-table', 'multivalued-not-split'],
            prompt: `Map the University ERD to a relational schema (PKs and FKs).`,
            erd: `ENTITY DEPARTMENT: *DeptCode, DeptName
ENTITY PROFESSOR: *ProfID, Name(FirstName, LastName), [Phone]
ENTITY COURSE: *CourseNo, Title, Credits
WEAK SECTION: ~SectionNo, Semester, Room
ENTITY STUDENT: *StudentID, Name, DOB, /Age
REL CHAIRS: PROFESSOR 1, DEPARTMENT 1 total | StartDate
REL BELONGS_TO: DEPARTMENT 1, PROFESSOR N total
IDREL HAS_SECTION: COURSE 1, SECTION N total
REL TEACHES: PROFESSOR 1, SECTION N total
REL ENROLLS: STUDENT M, SECTION N | Grade`,
            model: [`DEPARTMENT(DeptCode PK, DeptName, ChairID FK->PROFESSOR UNIQUE, StartDate)
PROFESSOR(ProfID PK, FirstName, LastName, DeptCode FK->DEPARTMENT)
PROFESSOR_PHONE(ProfID PK FK->PROFESSOR, Phone PK)
COURSE(CourseNo PK, Title, Credits)
SECTION(CourseNo PK FK->COURSE, SectionNo PK, Semester, Room, ProfID FK->PROFESSOR)
STUDENT(StudentID PK, Name, DOB)
ENROLLS(StudentID PK FK->STUDENT, CourseNo PK FK->SECTION, SectionNo PK FK->SECTION, Grade)`,
            `DEPARTMENT(DeptCode PK, DeptName, ChairID FK->PROFESSOR UNIQUE, StartDate)
PROFESSOR(ProfID PK, FirstName, LastName, DeptCode FK->DEPARTMENT)
PROFESSOR_PHONE(ProfID PK FK->PROFESSOR, Phone PK)
COURSE(CourseNo PK, Title, Credits)
SECTION(CourseNo PK FK->COURSE, SectionNo PK, Semester, Room, ProfID FK->PROFESSOR)
STUDENT(StudentID PK, Name, DOB)
ENROLLS(StudentID PK FK->STUDENT, CourseNo PK FK->COURSE, SectionNo PK FK->SECTION, Grade)`],
            notes: { kinds: { PROFESSOR_PHONE: 'multi', SECTION: 'weak', ENROLLS: 'mn', DEPARTMENT: '1:1' }, composite: { Name: ['FirstName', 'LastName'] }, derived: ['Age'], multivalued: { Phone: 'PROFESSOR_PHONE' } },
            aliases: { ChairID: ['ChairProfID', 'Chair', 'HeadID', 'ChairpersonID'], StartDate: ['ChairStartDate', 'ChairSince', 'Since'], ENROLLS: ['ENROLLMENT', 'ENROLL', 'TAKES'], PROFESSOR_PHONE: ['PHONE'] },
            solution: `<code>DEPARTMENT(DeptCode PK, DeptName, ChairID FK->PROFESSOR UNIQUE, StartDate)</code><br><code>PROFESSOR(ProfID PK, FirstName, LastName, DeptCode FK->DEPARTMENT)</code><br><code>PROFESSOR_PHONE(ProfID PK FK->PROFESSOR, Phone PK)</code><br><code>COURSE(CourseNo PK, Title, Credits)</code><br><code>SECTION(CourseNo PK FK->COURSE, SectionNo PK, Semester, Room, ProfID FK->PROFESSOR)</code><br><code>STUDENT(StudentID PK, Name, DOB)</code> (Age derived)<br><code>ENROLLS(StudentID PK FK->STUDENT, CourseNo PK, SectionNo PK, Grade)</code> where (CourseNo, SectionNo) is an FK to SECTION.`
          },
          {
            id: 'examB-explain', type: 'explain', points: 5,
            prompt: `Explain the mapping of SECTION, CHAIRS and ENROLLS and state your assumptions.`,
            keywords: [['weak', 'partial key', 'cascade', 'courseno'], ['1:1', 'one-to-one', 'one to one', 'unique', 'total'], ['m:n', 'many-to-many', 'many to many', 'both keys', 'junction', 'bridge'], ['assum']],
            sample: 'SECTION is weak: its table contains the owner key CourseNo (FK, ON DELETE CASCADE) + partial key SectionNo as PK. CHAIRS is 1:1 with DEPARTMENT total → ChairID UNIQUE + StartDate in DEPARTMENT. ENROLLS is M:N → own table with StudentID and the full key of SECTION (CourseNo, SectionNo) + Grade. Assumption: a student enrolls in a section only once.'
          }
        ]
      },
      {
        title: '3. Relational algebra / SQL', questions: [
          {
            id: 'examB-q1', type: 'query', points: 8,
            prompt: `Names of employees who do <b>not</b> work on any project.`,
            ra: `PROJECT[name]((PROJECT[eid](EMPLOYEE) MINUS PROJECT[eid](WORKS_ON)) NATURALJOIN EMPLOYEE)`,
            sql: `SELECT name FROM EMPLOYEE WHERE eid NOT IN (SELECT eid FROM WORKS_ON);`,
            tags: ['set-ops']
          },
          {
            id: 'examB-q2', type: 'query', points: 8,
            prompt: `Metro Bus: the lineno of lines that have used <b>all</b> buses of model 'Citaro'.`,
            ra: `PROJECT[lineno, busid](TRIP) DIVIDE PROJECT[busid](SELECT[model='Citaro'](BUS))`,
            sql: `SELECT l.lineno FROM LINE l WHERE NOT EXISTS (SELECT * FROM BUS b WHERE b.model = 'Citaro' AND NOT EXISTS (SELECT * FROM TRIP t WHERE t.lineno = l.lineno AND t.busid = b.busid));`,
            tags: ['division']
          },
          {
            id: 'examB-q3', type: 'query', points: 9,
            prompt: `For <b>every</b> department name, the total budget of its projects (departments without projects must appear, with NULL).`,
            ra: `GROUP[dname; SUM(budget) AS total](DEPARTMENT LEFTJOIN PROJECT)`,
            sql: `SELECT d.dname, SUM(p.budget) AS total FROM DEPARTMENT d LEFT JOIN PROJECT p ON d.deptid = p.deptid GROUP BY d.dname;`,
            tags: ['outer-join', 'aggregation']
          }
        ]
      },
      {
        title: '4. Normalization', intro: `R(A,B,C,D,E,F) with F = {A → B, B → C, CD → E, E → F}.`, questions: [
          { id: 'examB-n1', type: 'fd', ask: 'keys', points: 8, prompt: 'Find all candidate keys of R.', problem: 'R(A,B,C,D,E,F)\nA->B\nB->C\nCD->E\nE->F', tags: ['candidate-key'] },
          { id: 'examB-n2', type: 'fd', ask: 'nf', points: 7, prompt: 'What is the highest normal form of R?', problem: 'R(A,B,C,D,E,F)\nA->B\nB->C\nCD->E\nE->F', tags: ['partial-dependency'] },
          { id: 'examB-n3', type: 'fd', ask: 'decomp3nf', points: 10, prompt: 'Decompose R into 3NF (lossless and dependency preserving).', problem: 'R(A,B,C,D,E,F)\nA->B\nB->C\nCD->E\nE->F', tags: ['decomposition'] }
        ]
      }
    ]
  }
];
