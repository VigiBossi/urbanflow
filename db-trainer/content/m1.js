/* =====================================================================
   MODULE 1 — Entity Relationship (ER) Model, Chen notation
   Exercise types: mcq | text | erd | schema | query | fd   (see README "Adding content")
   ERD answers use the text format:  ENTITY / WEAK / REL / IDREL  (see js/erd.js)
   ===================================================================== */
CONTENT.modules.push({
  id: 'm1',
  title: 'Entity Relationship Model',
  short: 'ER Model (Chen)',
  icon: '◇',
  description: 'Turn a business story into entities, attributes and relationships, and draw them in Chen notation.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'm1l1',
      title: 'Entities: strong and weak',
      minutes: 15,
      intuition: `<p>Before building a database we ask a simple question: <b>what things does this business need to remember?</b> A university remembers students and courses; a shop remembers customers and orders. Each kind of "thing" is an <b>entity type</b>, and each individual (the student Anna) is an <b>entity</b>.</p>
<p>Most things can be recognised on their own (every student has a student number). But some things only make sense <i>attached to something else</i>: "Room 101" is meaningless until you say <i>which building</i>. Those are <b>weak entities</b>.</p>`,
      formal: `<ul>
<li><b>Entity type</b>: a set of objects with the same properties, drawn as a <b>rectangle</b> {{sym:entity}}</li>
<li><b>Strong (regular) entity</b>: has a <b>key attribute</b> of its own that identifies every instance.</li>
<li><b>Weak entity</b>: has <b>no key of its own</b>. It is identified by its <b>owner entity</b> (also called identifying or parent entity) plus its <b>partial key</b> (discriminator). Drawn as a <b>double rectangle</b> {{sym:weak}}</li>
<li><b>Identifying relationship</b>: links the weak entity to its owner; drawn as a <b>double diamond</b> {{sym:idrel}}</li>
<li>The weak entity always has <b>total participation</b> in the identifying relationship (double line): a room cannot exist without its building.</li>
<li><b>Partial key</b>: attribute that identifies a weak entity <i>only within one owner</i>; drawn with a <b>dashed underline</b> {{sym:partial}}</li>
</ul>`,
      worked: {
        problem: `<p>"A company keeps its EMPLOYEES (employee ID, name). For insurance it also stores each employee's DEPENDENTS (children, spouse): the dependent's first name and birth date. Two different employees may both have a child called Sara."</p>`,
        steps: [
          `<b>Find the nouns</b> the business remembers: employee, dependent. Both become entity types.`,
          `<b>Does EMPLOYEE have its own key?</b> Yes — EmpID is unique for each employee. So EMPLOYEE is a <b>strong</b> entity and EmpID is underlined.`,
          `<b>Does DEPENDENT have its own key?</b> The name "Sara" is not unique across the company (two employees may have a Sara). A dependent is only identified <i>together with its employee</i>: (EmpID, DepName). So DEPENDENT is <b>weak</b>, its owner is EMPLOYEE and DepName is the <b>partial key</b> (dashed underline).`,
          `<b>Connect them</b> with an identifying relationship HAS_DEPENDENT (double diamond). One employee has many dependents → 1:N. Every dependent must belong to an employee → <b>total participation</b> (double line) on the DEPENDENT side.`
        ],
        erd: `ENTITY EMPLOYEE: *EmpID, Name
WEAK DEPENDENT: ~DepName, BirthDate
IDREL HAS_DEPENDENT: EMPLOYEE 1, DEPENDENT N total`
      },
      exercises: [
        {
          id: 'm1l1e1', type: 'mcq', level: 1, tags: ['weak-entity-notation'],
          prompt: `A university has BUILDINGS (building code, name). Each building has ROOMS numbered 1, 2, 3 ... and the same room number is used in every building. Which statement is right?`,
          options: ['ROOM is a strong entity with key RoomNo', 'ROOM is a weak entity, owner BUILDING, partial key RoomNo', 'BUILDING is a weak entity of ROOM', 'RoomNo should be a multivalued attribute of BUILDING'],
          answer: 1,
          hints: ['Is room number "3" unique in the whole university?', 'If you need a second piece of information to identify a room, the entity is weak.'],
          solution: `ROOM is <b>weak</b>: RoomNo repeats in every building, so a room is identified by (BuildingCode, RoomNo). BUILDING is the owner and RoomNo is the partial key (dashed underline).`
        },
        {
          id: 'm1l1e2', type: 'text', level: 2, tags: ['weak-entity-key'],
          prompt: `A bank stores ACCOUNTS (account number, balance). Each account has TRANSACTIONS numbered 1, 2, 3 ... inside that account (transaction no., date, amount). <br><b>Name the weak entity, its owner, and its partial key.</b>`,
          keywords: [['transaction'], ['account'], ['transactionno', 'transactionnumber', 'transno', 'transactionid', 'number', 'no']],
          sample: 'TRANSACTION is the weak entity, owner ACCOUNT, partial key TransactionNo.',
          hints: ['Which numbering restarts for every account?', 'The weak entity is the one whose number restarts; the owner is the one it depends on.'],
          solution: `<b>TRANSACTION</b> is weak (transaction 1 exists in every account). Owner: <b>ACCOUNT</b>. Partial key: <b>TransactionNo</b>. Full identifier: (AccountNo, TransactionNo).`
        },
        {
          id: 'm1l1e3', type: 'erd', level: 3, tags: ['weak-entity-notation', 'weak-entity-key'],
          prompt: `Draw the ERD: "A HOTEL (hotel ID, name, city) has many ROOMs. Rooms are numbered per hotel (room number, floor, price per night). A room cannot exist without its hotel."`,
          model: `ENTITY HOTEL: *HotelID, Name, City
WEAK ROOM: ~RoomNo, Floor, Price
IDREL HAS_ROOM: HOTEL 1 ?, ROOM N total`,
          aliases: { RoomNo: ['RoomNumber', 'RoomNum'], Price: ['PricePerNight', 'NightPrice', 'Rate'], HAS_ROOM: ['HAS', 'CONTAINS'] },
          hints: ['Two entity types. Which one cannot be identified alone?', 'ROOM is weak: double rectangle, RoomNo partial key (choose type "partial key").', 'The relationship must be identifying (double diamond) with total participation for ROOM.'],
          solution: `HOTEL is strong (key HotelID). ROOM is weak with partial key RoomNo. They are linked by an identifying relationship (1 HOTEL : N ROOMs) and ROOM has total participation.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'Which Chen symbol represents a weak entity?', options: ['Rectangle', 'Double rectangle', 'Double diamond', 'Dashed oval'], answer: 1, explain: 'Weak entity = double rectangle. A double diamond is the identifying relationship that connects it to its owner.' },
        { type: 'mcq', prompt: 'A weak entity is identified by…', options: ['its partial key only', 'the owner\'s key only', 'the owner\'s key + its partial key', 'a derived attribute'], answer: 2, explain: 'The partial key is unique only inside one owner, so you need owner key + partial key.' },
        { type: 'mcq', prompt: 'The participation of a weak entity in its identifying relationship is always…', options: ['partial', 'total', 'optional', 'M:N'], answer: 1, explain: 'A weak entity cannot exist without its owner, so every instance participates → total (double line).' },
        { type: 'text', prompt: 'How is a partial key drawn in Chen notation? (a few words)', keywords: [['dash', 'dotted', 'broken']], sample: 'With a dashed underline.', explain: 'Key attribute = solid underline; partial key = dashed underline.' },
        { type: 'mcq', prompt: 'ORDER_LINE has line numbers 1, 2, 3 restarting in every ORDER. ORDER_LINE is…', options: ['a strong entity', 'a weak entity owned by ORDER', 'a relationship', 'a multivalued attribute'], answer: 1, explain: 'Line numbers repeat across orders → identified by (OrderID, LineNo) → weak entity, owner ORDER.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm1l2',
      title: 'Attributes: simple, composite, multivalued, derived, key',
      minutes: 15,
      intuition: `<p>Attributes are the <b>facts</b> we store about an entity, like the labels on a form. Some facts are a single value (a birth date). Some facts are made of <i>parts</i> (an address = street + city + ZIP). Some facts can have <i>several values</i> (a person can have two phone numbers). Some facts can be <i>computed</i> from others (age from birth date) — we don't really need to store those.</p>`,
      formal: `<table class="t"><tr><th>Type</th><th>Meaning</th><th>Chen symbol</th></tr>
<tr><td>Simple (atomic)</td><td>cannot be divided further (Salary)</td><td>oval {{sym:attr}}</td></tr>
<tr><td>Composite</td><td>made of sub-parts (Name → FirstName, LastName)</td><td>oval connected to smaller ovals {{sym:composite}}</td></tr>
<tr><td>Multivalued</td><td>may have several values for one entity (Phone)</td><td>double oval {{sym:multi}}</td></tr>
<tr><td>Derived</td><td>can be computed from other data (Age from DOB)</td><td>dashed oval {{sym:derived}}</td></tr>
<tr><td>Key</td><td>value is unique for each entity (StudentID)</td><td>underlined {{sym:key}}</td></tr>
</table>
<p>Attributes can combine types: a composite attribute can also be multivalued (several addresses), etc.</p>`,
      worked: {
        problem: `<p>"For each STUDENT we store a student number, the name (first and last), the birth date, the age, and all their email addresses."</p>`,
        steps: [
          `<b>Key:</b> student number is unique → <b>StudentID</b>, underlined.`,
          `<b>Composite:</b> name has parts first + last → <b>Name</b> oval with two smaller ovals FirstName and LastName.`,
          `<b>Simple:</b> BirthDate is one value.`,
          `<b>Derived:</b> age can be computed from BirthDate and today's date → <b>Age</b> as a dashed oval.`,
          `<b>Multivalued:</b> "all their email addresses" → several values → <b>Email</b> as a double oval.`
        ],
        erd: `ENTITY STUDENT: *StudentID, Name(FirstName, LastName), BirthDate, /Age, [Email]`
      },
      exercises: [
        {
          id: 'm1l2e1', type: 'mcq', level: 1, tags: ['attribute-type'],
          prompt: `An EMPLOYEE can speak several languages, and we store all of them. "Languages" is a…`,
          options: ['simple attribute', 'composite attribute', 'multivalued attribute', 'derived attribute'], answer: 2,
          hints: ['How many values can one employee have?'],
          solution: `Several values for one employee → <b>multivalued</b> → double oval.`
        },
        {
          id: 'm1l2e2', type: 'mcq', level: 2, tags: ['composite', 'attribute-type'],
          prompt: `Which pair is correct?`,
          options: ['Address (street, city, ZIP) = multivalued; Phones = composite', 'Address (street, city, ZIP) = composite; Phones = multivalued', 'Both are composite', 'Both are derived'], answer: 1,
          hints: ['Composite = one value made of parts. Multivalued = many values.'],
          solution: `An address is <b>one</b> value made of <b>parts</b> → composite. Several phone numbers → multivalued. This is the most common trap in exams!`
        },
        {
          id: 'm1l2e3', type: 'erd', level: 3, tags: ['composite', 'multivalued-notation', 'derived-notation'],
          prompt: `Draw one entity: "A CUSTOMER has a customer ID, a name (first and last), an address (street, city, ZIP), one or more email addresses, a date of birth, and an age that the system calculates."`,
          model: `ENTITY CUSTOMER: *CustomerID, Name(FirstName, LastName), Address(Street, City, ZIP), [Email], DateOfBirth, /Age`,
          aliases: { CustomerID: ['CustID', 'CustomerNo'] },
          hints: ['Six attributes. One key, two composites, one multivalued, one derived, one simple.', 'For a composite, type the parts in the "parts" box, e.g. FirstName, LastName.'],
          solution: `CustomerID (key), Name and Address (composite with their parts), Email (multivalued, double oval), DateOfBirth (simple), Age (derived, dashed oval).`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'A dashed oval means…', options: ['key attribute', 'partial key', 'derived attribute', 'multivalued attribute'], answer: 2, explain: 'Dashed oval = derived (computed) attribute.' },
        { type: 'mcq', prompt: '"Number of employees" of a DEPARTMENT, computed by counting its employees, is…', options: ['derived', 'multivalued', 'composite', 'a key'], answer: 0, explain: 'It can be computed from other data → derived.' },
        { type: 'mcq', prompt: 'Which attribute is most likely composite?', options: ['Salary', 'FullAddress (street, city, ZIP)', 'Colors of a car', 'ISBN'], answer: 1, explain: 'An address is made of parts → composite.' },
        { type: 'text', prompt: 'How is a multivalued attribute drawn? (a few words)', keywords: [['double', 'two']], sample: 'As a double oval.', explain: 'Multivalued attribute = double oval (double ellipse).' },
        { type: 'mcq', prompt: 'A key attribute is drawn…', options: ['in a double oval', 'with its name underlined', 'in a dashed oval', 'in a diamond'], answer: 1, explain: 'Key attribute names are underlined (solid line). Partial keys use a dashed underline.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm1l3',
      title: 'Relationships: degree, cardinality, participation',
      minutes: 20,
      intuition: `<p>Entities don't live alone: a student <i>enrolls in</i> courses, an employee <i>works for</i> a department. A <b>relationship</b> is a verb that connects entities. To describe it we ask two questions in both directions: <b>"how many?"</b> (cardinality) and <b>"must every one take part?"</b> (participation).</p>`,
      formal: `<ul>
<li><b>Relationship type</b>: an association between entity types, drawn as a <b>diamond</b> {{sym:rel}}</li>
<li><b>Degree</b>: number of entity types involved — unary/recursive (1, e.g. EMPLOYEE supervises EMPLOYEE), binary (2), ternary (3).</li>
<li><b>Cardinality ratio</b>: maximum number of relationship instances an entity can take part in: <b>1:1</b>, <b>1:N</b>, <b>M:N</b>. The number written next to an entity tells how many of <i>that</i> entity are related to <i>one</i> instance on the other side.</li>
<li><b>Participation</b> (minimum): <b>total</b> = every entity must participate (double line {{sym:total}}); <b>partial</b> = some may not (single line {{sym:partialp}}).</li>
<li><b>Relationship attributes</b>: facts that belong to the <i>pair</i>, not to either entity alone (e.g. the Grade of a student in a course). They are ovals attached to the diamond.</li>
</ul>
<p><b>Trick to find cardinality:</b> say two sentences. "One department has <u>many</u> employees." "One employee works in <u>one</u> department." → DEPARTMENT 1 : N EMPLOYEE.</p>`,
      worked: {
        problem: `<p>"Every employee works for exactly one department; a department has many employees. Each department is managed by one employee, and we store the start date of the manager. Employees work on many projects and projects have many employees; we store the hours per week."</p>`,
        steps: [
          `<b>WORKS_FOR</b> (EMPLOYEE–DEPARTMENT): one department → many employees; one employee → one department. So <b>DEPARTMENT 1 : N EMPLOYEE</b>. "Every employee works for exactly one" → EMPLOYEE has <b>total</b> participation (double line).`,
          `<b>MANAGES</b> (EMPLOYEE–DEPARTMENT): one manager per department, and an employee manages at most one department → <b>1:1</b>. Every department has a manager → DEPARTMENT total; most employees are not managers → EMPLOYEE partial. StartDate describes the <i>managing</i>, not the employee alone → relationship attribute.`,
          `<b>WORKS_ON</b> (EMPLOYEE–PROJECT): many to many → <b>M:N</b>. Hours belongs to one employee <i>on one project</i> → relationship attribute.`,
          `Note: two different relationships can connect the same two entities (WORKS_FOR and MANAGES).`
        ],
        erd: `ENTITY EMPLOYEE: *EmpID, Name
ENTITY DEPARTMENT: *DeptID, DeptName
ENTITY PROJECT: *ProjID, ProjName
REL WORKS_FOR: DEPARTMENT 1, EMPLOYEE N total
REL MANAGES: EMPLOYEE 1, DEPARTMENT 1 total | StartDate
REL WORKS_ON: EMPLOYEE M, PROJECT N | Hours`
      },
      exercises: [
        {
          id: 'm1l3e1', type: 'mcq', level: 1, tags: ['cardinality'],
          prompt: `"A student can enroll in many courses, and a course has many students." The cardinality of ENROLLS is…`,
          options: ['1:1', '1:N', 'N:1', 'M:N'], answer: 3,
          hints: ['Say it in both directions: one student → how many courses? one course → how many students?'],
          solution: `Many in both directions → <b>M:N</b>.`
        },
        {
          id: 'm1l3e2', type: 'text', level: 2, tags: ['rel-attr-misplaced'],
          prompt: `In the M:N relationship STUDENT – ENROLLS – COURSE we must store the <b>grade</b>. Where does Grade go, and why? (one sentence)`,
          keywords: [['enroll', 'relationship', 'diamond']],
          sample: 'On the relationship ENROLLS, because a grade belongs to one student in one course.',
          hints: ['Does a student have one grade? Does a course have one grade?', 'The grade depends on the PAIR (student, course).'],
          solution: `Grade is a <b>relationship attribute of ENROLLS</b>: it describes one student <i>in</i> one course. Putting it on STUDENT would allow only one grade per student.`
        },
        {
          id: 'm1l3e3', type: 'erd', level: 3, tags: ['cardinality', 'participation', 'rel-attr-misplaced'],
          prompt: `Draw the ERD: "STUDENTs (student ID, name) enroll in COURSEs (course code, title); we store the grade of each enrollment. Every course is taught by exactly one PROFESSOR (professor ID, name); a professor can teach many courses or none."`,
          model: `ENTITY STUDENT: *StudentID, Name
ENTITY COURSE: *CourseCode, Title
ENTITY PROFESSOR: *ProfID, Name
REL ENROLLS: STUDENT M ?, COURSE N ? | Grade
REL TEACHES: PROFESSOR 1 false, COURSE N total`,
          aliases: { ProfID: ['ProfessorID', 'ProfNo'], CourseCode: ['CourseID', 'CourseNo', 'Code'], ENROLLS: ['ENROLL', 'TAKES', 'ENROLLMENT'], TEACHES: ['TEACH', 'TAUGHT_BY'] },
          hints: ['3 entities, 2 relationships.', 'TEACHES: one professor → many courses; one course → exactly one professor. Which side has total participation?', 'Grade goes on the ENROLLS diamond.'],
          solution: `ENROLLS is M:N with attribute Grade. TEACHES is PROFESSOR 1 : N COURSE, with total participation of COURSE ("exactly one") and partial participation of PROFESSOR ("or none").`
        },
        {
          id: 'm1l3e4', type: 'erd', level: 4, tags: ['cardinality', 'participation'],
          prompt: `Recursive relationship: "An EMPLOYEE (employee ID, name) may supervise other employees. Each employee has at most one supervisor." Draw it with ONE entity and ONE relationship SUPERVISES (the entity appears on both ends).`,
          model: `ENTITY EMPLOYEE: *EmpID, Name
REL SUPERVISES: EMPLOYEE 1 ?, EMPLOYEE N ?`,
          aliases: { SUPERVISES: ['SUPERVISE', 'SUPERVISION', 'MANAGES', 'REPORTS_TO'] },
          hints: ['Add the relationship with EMPLOYEE as entity A and also as entity B.', 'One supervisor → many supervisees: 1 on one end, N on the other.'],
          solution: `A <b>unary (recursive)</b> relationship: EMPLOYEE (as supervisor, 1) — SUPERVISES — EMPLOYEE (as supervisee, N). Participation is partial on both sides (the boss has no supervisor; many employees supervise nobody).`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'A double line between an entity and a relationship means…', options: ['M:N', 'total participation', 'weak entity', 'derived attribute'], answer: 1, explain: 'Double line = total participation: every instance of that entity must take part.' },
        { type: 'mcq', prompt: 'A relationship between SUPPLIER, PART and PROJECT is of degree…', options: ['1', '2', '3', 'M:N'], answer: 2, explain: 'Three entity types → ternary relationship (degree 3).' },
        { type: 'mcq', prompt: '"Each person has at most one passport; each passport belongs to exactly one person." This is…', options: ['1:1', '1:N', 'M:N', 'ternary'], answer: 0, explain: 'One in both directions → 1:1 (with PASSPORT total).' },
        { type: 'text', prompt: 'The "Hours" an employee works on a project belongs to… (entity or relationship?)', keywords: [['relationship', 'workson', 'works on', 'diamond']], sample: 'The relationship WORKS_ON.', explain: 'Hours depends on the pair (employee, project) → relationship attribute.' },
        { type: 'mcq', prompt: 'DEPARTMENT 1 : N EMPLOYEE means…', options: ['one employee works in many departments', 'one department has many employees, each employee in one department', 'every department has exactly one employee', 'employees and departments are M:N'], answer: 1, explain: 'Read it: one department relates to N employees; one employee relates to 1 department.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm1l4',
      title: 'From a story to a complete ERD (Chen symbols)',
      minutes: 30,
      intuition: `<p>An exam ERD question is a <b>short story</b>. You read it like a detective: <b>nouns</b> usually become entities or attributes, <b>verbs</b> become relationships, and words like "exactly one", "at least one", "many", "may" tell you the cardinality and participation.</p>`,
      formal: `<p><b>Chen symbol summary</b></p>
<table class="t">
<tr><td>{{sym:entity}}</td><td>Entity (rectangle)</td><td>{{sym:weak}}</td><td>Weak entity (double rectangle)</td></tr>
<tr><td>{{sym:rel}}</td><td>Relationship (diamond)</td><td>{{sym:idrel}}</td><td>Identifying relationship (double diamond)</td></tr>
<tr><td>{{sym:attr}}</td><td>Attribute (oval)</td><td>{{sym:multi}}</td><td>Multivalued (double oval)</td></tr>
<tr><td>{{sym:derived}}</td><td>Derived (dashed oval)</td><td>{{sym:key}}</td><td>Key (underlined)</td></tr>
<tr><td>{{sym:partial}}</td><td>Partial key (dashed underline)</td><td>{{sym:total}}</td><td>Total participation (double line)</td></tr>
</table>
<p><b>Recipe:</b> (1) list the entities and their keys; (2) mark weak entities and partial keys; (3) add attributes with their type; (4) find each relationship, its cardinality in both directions and participation on both sides; (5) put "pair facts" (dates, quantities, grades) on relationships; (6) draw.</p>`,
      worked: {
        problem: `<p>"A gym has MEMBERS (member ID, name, several phone numbers). The gym offers CLASSES (class code, title). Each class is led by exactly one TRAINER (trainer ID, name); a trainer leads many classes. Members book classes; for each booking we store the booking date."</p>`,
        steps: [
          `<b>Entities + keys:</b> MEMBER (MemberID), CLASS (ClassCode), TRAINER (TrainerID). No weak entity here — each has its own key.`,
          `<b>Attributes:</b> MEMBER.Name (simple), MEMBER.Phone (<b>multivalued</b>: "several phone numbers"), CLASS.Title, TRAINER.Name.`,
          `<b>LEADS</b>: TRAINER 1 : N CLASS. "Each class is led by exactly one trainer" → CLASS total participation.`,
          `<b>BOOKS</b>: a member books many classes, a class has many members → M:N. BookingDate is a fact about one member booking one class → relationship attribute.`
        ],
        erd: `ENTITY MEMBER: *MemberID, Name, [Phone]
ENTITY CLASS: *ClassCode, Title
ENTITY TRAINER: *TrainerID, Name
REL LEADS: TRAINER 1, CLASS N total
REL BOOKS: MEMBER M, CLASS N | BookingDate`
      },
      exercises: [
        {
          id: 'm1l4e1', type: 'mcq', level: 1, tags: ['chen-symbols'],
          prompt: `In Chen notation, a double diamond is…`,
          options: ['an M:N relationship', 'an identifying relationship of a weak entity', 'a ternary relationship', 'a relationship with attributes'], answer: 1,
          hints: ['Double shapes are connected with "weak" things.'],
          solution: `Double diamond = <b>identifying relationship</b>; it connects a weak entity (double rectangle) to its owner.`
        },
        {
          id: 'm1l4e2', type: 'erd', level: 3, tags: ['cardinality', 'participation', 'rel-attr-misplaced', 'derived-notation'],
          prompt: `Draw the ERD: "An online shop has CUSTOMERs (customer ID, name, email). A customer places ORDERs (order ID, order date, total amount — the total is computed from the order lines). Every order is placed by exactly one customer. An order contains many PRODUCTs (product ID, name, price) and a product can be in many orders; for each product in an order we store the quantity."`,
          model: `ENTITY CUSTOMER: *CustomerID, Name, Email
ENTITY ORDER: *OrderID, OrderDate, /TotalAmount
ENTITY PRODUCT: *ProductID, Name, Price
REL PLACES: CUSTOMER 1 ?, ORDER N total
REL CONTAINS: ORDER M ?, PRODUCT N ? | Quantity`,
          aliases: { ORDER: ['ORDERS', 'PURCHASE'], TotalAmount: ['Total', 'Amount', 'TotalPrice'], PLACES: ['PLACE', 'MAKES', 'PLACED_BY'], CONTAINS: ['CONTAIN', 'INCLUDES', 'ORDER_LINE', 'ORDERLINE'], Quantity: ['Qty', 'Amount'] },
          hints: ['3 entities. Which attribute is computed?', 'PLACES: one customer → many orders; one order → exactly one customer (total on ORDER).', 'Quantity belongs to (order, product) → on the CONTAINS diamond.'],
          solution: `TotalAmount is <b>derived</b> (dashed oval). PLACES is CUSTOMER 1 : N ORDER with ORDER total. CONTAINS is M:N with the relationship attribute Quantity.`
        },
        {
          id: 'm1l4e3', type: 'erd', level: 5, tags: ['weak-entity-notation', 'weak-entity-key', 'multivalued-notation', 'composite', 'cardinality', 'participation', 'rel-attr-misplaced'],
          exam: true,
          prompt: `<b>Library (exam style).</b> Members (member ID, name first+last, address street/city/ZIP, multiple phones), each with exactly one LIBRARY_CARD (card number, issue date, expiry date). BOOKs (ISBN, title, set of keywords) are published by exactly one PUBLISHER (ID, name, country). Books are written by many AUTHORs (ID, name, nationality) and authors write many books. Physical COPYs are identified only by copy number together with the book (shelf location, condition). Members borrow copies (M:N) with loan date, due date, return date.
<br><br>Tasks: (a) entities and attributes with key/composite/multivalued marked and the weak entity, (b) relationships with cardinalities and relationship attributes, (c) the ERD.`,
          model: `ENTITY MEMBER: *MemberID, Name(FirstName, LastName), Address(Street, City, ZIP), [Phone]
ENTITY LIBRARY_CARD: *CardNumber, IssueDate, ExpiryDate
ENTITY BOOK: *ISBN, Title, [Keyword]
ENTITY PUBLISHER: *PublisherID, Name, Country
ENTITY AUTHOR: *AuthorID, Name, Nationality
WEAK COPY: ~CopyNumber, ShelfLocation, Condition
REL HAS_CARD: MEMBER 1 total, LIBRARY_CARD 1 total
REL PUBLISHED_BY: BOOK N total, PUBLISHER 1 ?
REL WRITES: AUTHOR M ?, BOOK N ?
IDREL HAS_COPY: BOOK 1 ?, COPY N total
REL BORROWS: MEMBER M ?, COPY N ? | LoanDate, DueDate, ReturnDate`,
          aliases: { MEMBER: ['PATRON', 'LIBRARY_MEMBER', 'BORROWER'], LIBRARY_CARD: ['CARD', 'LIBRARYCARD', 'MEMBERSHIP_CARD'], COPY: ['BOOK_COPY', 'BOOKCOPY', 'PHYSICAL_COPY', 'ITEM'], CardNumber: ['CardNo', 'CardID', 'CardNum'], CopyNumber: ['CopyNo', 'CopyID', 'CopyNum'], Keyword: ['Keywords', 'KeyWord'], ShelfLocation: ['Shelf', 'Location', 'ShelfLoc'], MemberID: ['MemberNo', 'MID'], ExpiryDate: ['ExpirationDate', 'ExpDate', 'ValidUntil'], IssueDate: ['IssuedDate', 'DateIssued'], PublisherID: ['PubID', 'PublisherNo'], AuthorID: ['AuthID', 'AuthorNo'], HAS_CARD: ['HAS', 'OWNS', 'HOLDS'], PUBLISHED_BY: ['PUBLISHES', 'PUBLISH'], WRITES: ['WRITTEN_BY', 'AUTHORED_BY', 'WROTE', 'WRITE'], HAS_COPY: ['HAS', 'COPY_OF', 'HASCOPY'], BORROWS: ['LOAN', 'LOANS', 'BORROW', 'BORROWING'] },
          hints: ['6 entities: MEMBER, LIBRARY_CARD, BOOK, PUBLISHER, AUTHOR, COPY. Which one is weak?', 'Name and Address are composite; Phone and Keyword are multivalued.', 'COPY is weak: partial key CopyNumber; owner BOOK via an identifying relationship (double diamond).', 'MEMBER–LIBRARY_CARD is 1:1 with total participation on both sides ("exactly one").', 'Loan dates belong to the BORROWS relationship, not to COPY or MEMBER.'],
          solution: `<b>(a)</b> MEMBER(<u>MemberID</u>, Name(First, Last) composite, Address(Street, City, ZIP) composite, {Phone} multivalued); LIBRARY_CARD(<u>CardNumber</u>, IssueDate, ExpiryDate); BOOK(<u>ISBN</u>, Title, {Keyword} multivalued); PUBLISHER(<u>PublisherID</u>, Name, Country); AUTHOR(<u>AuthorID</u>, Name, Nationality); <b>COPY weak</b>(partial key CopyNumber, ShelfLocation, Condition).<br>
<b>(b)</b> HAS_CARD MEMBER 1:1 LIBRARY_CARD (both total); PUBLISHED_BY BOOK N:1 PUBLISHER (BOOK total); WRITES AUTHOR M:N BOOK; HAS_COPY BOOK 1:N COPY — identifying, COPY total; BORROWS MEMBER M:N COPY with LoanDate, DueDate, ReturnDate.<br><b>(c)</b> see the diagram.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'In a story, verbs such as "teaches", "borrows", "places" usually become…', options: ['entities', 'attributes', 'relationships', 'keys'], answer: 2, explain: 'Verbs connect things → relationships (diamonds).' },
        { type: 'mcq', prompt: '"A product may be in no order at all." This tells you…', options: ['PRODUCT has total participation', 'PRODUCT has partial participation', 'the relationship is 1:1', 'PRODUCT is weak'], answer: 1, explain: '"may … none" → not every product participates → partial (single line).' },
        { type: 'mcq', prompt: 'A LoanDate in a MEMBER–BORROWS–COPY model is best placed…', options: ['on MEMBER', 'on COPY', 'on BORROWS', 'as a separate entity'], answer: 2, explain: 'It describes one member borrowing one copy → relationship attribute.' },
        { type: 'text', prompt: 'Name the symbol used for a weak entity\'s identifying relationship.', keywords: [['double diamond', 'doublediamond', 'two diamonds']], sample: 'A double diamond.', explain: 'Identifying relationship = double diamond.' },
        { type: 'mcq', prompt: '"Every book is published by exactly one publisher." The participation of BOOK in PUBLISHED_BY is…', options: ['partial', 'total', 'M:N', 'derived'], answer: 1, explain: '"Every … exactly one" → every book participates → total (double line).' }
      ]
    }
  ],
  review: {
    definitions: [
      ['Entity / entity type', 'A thing the business remembers / a set of similar things (rectangle).'],
      ['Weak entity', 'No key of its own; identified by owner key + partial key (double rectangle).'],
      ['Identifying relationship', 'Connects a weak entity to its owner (double diamond).'],
      ['Partial key', 'Identifies a weak entity only within one owner (dashed underline).'],
      ['Composite / multivalued / derived', 'Made of parts / several values (double oval) / computed (dashed oval).'],
      ['Cardinality', 'Maximum: 1:1, 1:N, M:N.'],
      ['Participation', 'Minimum: total (double line, every instance) or partial (single line).'],
      ['Degree', 'Number of entity types in a relationship: unary, binary, ternary.']
    ],
    rules: [
      'Always ask cardinality in BOTH directions: "one A → how many B?" and "one B → how many A?".',
      '"exactly one", "must", "every" → total participation. "may", "can be zero" → partial.',
      'Facts that belong to a pair (grade, hours, quantity, dates of a loan) go on the relationship.',
      'Weak entity: double rectangle + double diamond + dashed-underlined partial key + total participation.'
    ],
    traps: [
      'Composite ≠ multivalued: Address(street, city) is composite; several phones is multivalued.',
      'Do not give a weak entity its own key — then it would be strong.',
      'Do not put Grade/Hours/Quantity on an entity.',
      'Derived attributes (Age, Total) are drawn dashed and later NOT stored.'
    ],
    example: `<p><b>Story:</b> Employees (ID, name) have dependents (first name, birth date) identified only together with the employee.</p><p><b>ERD:</b> EMPLOYEE (<u>EmpID</u>, Name) — HAS_DEPENDENT (double diamond, 1:N) — DEPENDENT (double rectangle, <span style="border-bottom:1px dashed">DepName</span>, BirthDate), double line on DEPENDENT side.</p>`
  }
});
