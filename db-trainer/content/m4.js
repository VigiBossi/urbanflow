/* =====================================================================
   MODULE 4 — Functional Dependencies & Normalization
   FD exercises: { type:'fd', problem:'R(A,B,C,D)\nA->B', ask:'closure'|'keys'|'prime'|'nf'|'cover'|'decomp3nf'|'decompbcnf', of:'A' }
   The correct answer is COMPUTED by js/fd.js, so you only write the problem.
   ===================================================================== */
CONTENT.modules.push({
  id: 'm4',
  title: 'Functional Dependencies & Normalization',
  short: 'FDs & Normalization',
  icon: '→',
  description: 'Closures, keys, minimal covers, 1NF–BCNF and lossless decompositions — with a step-by-step normalization tool.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'm4l1',
      title: 'Functional dependencies and Armstrong\'s axioms',
      minutes: 20,
      intuition: `<p>A functional dependency is a rule of the business: <b>"if I know X, I know Y"</b>. If I know your student ID, I know your name — always, for everybody. We write <b>StudentID → Name</b>. Normalization is all about finding these rules and making sure every fact is stored in only <b>one</b> place.</p>`,
      formal: `<ul>
<li><b>X → Y</b> holds in R if any two rows that agree on X also agree on Y.</li>
<li><b>Trivial FD</b>: Y ⊆ X (e.g. AB → A) — always true, says nothing.</li>
<li><b>Armstrong's axioms</b> (sound and complete):
<ul><li><b>Reflexivity</b>: if Y ⊆ X then X → Y.</li>
<li><b>Augmentation</b>: if X → Y then XZ → YZ.</li>
<li><b>Transitivity</b>: if X → Y and Y → Z then X → Z.</li></ul></li>
<li><b>Derived rules</b>:
<ul><li><b>Union</b>: X → Y and X → Z ⟹ X → YZ.</li>
<li><b>Decomposition</b>: X → YZ ⟹ X → Y and X → Z.</li>
<li><b>Pseudotransitivity</b>: X → Y and WY → Z ⟹ WX → Z.</li></ul></li>
<li>Careful: <b>XY → Z does NOT imply X → Z</b>, and X → Y does NOT imply Y → X.</li>
</ul>
<p>Type FDs in plain text: <code>A->B</code>, <code>AB->C</code> (single letters), or <code>StudentID, Course -> Grade</code>.</p>`,
      worked: {
        problem: `<p>Given F = {A → B, B → C, C → D}, prove A → D and A → BD.</p>`,
        steps: [
          `A → B and B → C give <b>A → C</b> (transitivity).`,
          `A → C and C → D give <b>A → D</b> (transitivity).`,
          `A → B and A → D give <b>A → BD</b> (union).`,
          `Check with the closure (next lesson): A+ = ABCD contains B and D, so A → BD holds.`
        ]
      },
      exercises: [
        {
          id: 'm4l1e1', type: 'mcq', level: 1, tags: ['fd-basics'],
          prompt: `From A → B we derive AC → BC. Which rule is that?`,
          options: ['Reflexivity', 'Augmentation', 'Transitivity', 'Decomposition'], answer: 1,
          hints: ['We added the same attribute C to both sides.'],
          solution: `Adding C to both sides is <b>augmentation</b>.`
        },
        {
          id: 'm4l1e2', type: 'mcq', level: 1, tags: ['fd-basics'],
          prompt: `Which FD is trivial?`,
          options: ['A → B', 'AB → A', 'A → AB', 'AB → C'], answer: 1,
          hints: ['Trivial: the right side is inside the left side.'],
          solution: `AB → A: A ⊆ AB → trivial (reflexivity). Note A → AB is <i>not</i> trivial (B is new).`
        },
        {
          id: 'm4l1e3', type: 'text', level: 2, tags: ['fd-basics'],
          prompt: `Given A → B and A → C. Write the single FD you get with the <b>union</b> rule.`,
          keywords: [['a->bc', 'a->cb', 'a->b,c', 'a->c,b']],
          sample: 'A->BC',
          hints: ['Union combines two FDs with the same left side.'],
          solution: `<b>A → BC</b> (union rule).`
        },
        {
          id: 'm4l1e4', type: 'mcq', level: 3, tags: ['fd-basics'],
          prompt: `Given A → B and CB → D. Which FD follows by pseudotransitivity?`,
          options: ['A → D', 'AC → D', 'C → D', 'B → D'], answer: 1,
          hints: ['Pseudotransitivity: X → Y and WY → Z give WX → Z. Here X = A, Y = B, W = C.'],
          solution: `X = A, Y = B, W = C → <b>CA → D</b>, i.e. AC → D. (A → D alone does not follow: we still need C.)`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'X → Y means…', options: ['each X value appears once', 'rows equal on X are equal on Y', 'Y determines X', 'X is a key'], answer: 1, explain: 'Same X ⟹ same Y.' },
        { type: 'mcq', prompt: 'Transitivity says…', options: ['X → Y, Y → Z ⟹ X → Z', 'X → Y ⟹ XZ → YZ', 'Y ⊆ X ⟹ X → Y', 'X → YZ ⟹ X → Y'], answer: 0, explain: 'Chain the arrows.' },
        { type: 'mcq', prompt: 'From AB → C we can conclude…', options: ['A → C', 'B → C', 'ABD → C', 'C → AB'], answer: 2, explain: 'Adding attributes on the left keeps it true (augmentation + decomposition). Removing them does not.' },
        { type: 'mcq', prompt: 'Decomposition rule: from X → YZ we get…', options: ['X → Y and X → Z', 'Y → Z', 'XY → Z', 'nothing'], answer: 0, explain: 'You can split the right side (never the left side!).' },
        { type: 'text', prompt: 'Which three axioms are Armstrong\'s axioms? (names)', keywords: [['reflex'], ['augment'], ['transit']], sample: 'Reflexivity, augmentation, transitivity', explain: 'Union, decomposition and pseudotransitivity are derived from them.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm4l2',
      title: 'Attribute closure, candidate keys, prime attributes',
      minutes: 25,
      intuition: `<p>The <b>closure X+</b> answers: "if I know X, what else can I find out?" You start with X and keep applying FDs like dominoes until nothing new falls. If X+ contains <b>all</b> attributes, X is a <b>superkey</b>. A <b>candidate key</b> is a superkey with nothing extra — remove any attribute and it stops working.</p>`,
      formal: `<p><b>Algorithm X+</b>: result := X; repeat: for each FD A → B in F, if A ⊆ result then result := result ∪ B; until no change.</p>
<ul><li><b>Superkey</b>: X+ = all attributes of R.</li>
<li><b>Candidate key</b>: a minimal superkey (no proper subset is a superkey).</li>
<li><b>Prime attribute</b>: belongs to <i>some</i> candidate key. Non-prime: belongs to none.</li>
<li><b>Shortcut</b>: an attribute that never appears on a right side must be in <b>every</b> key; an attribute that appears only on right sides is in <b>no</b> key. Start from the "must" set, compute its closure, then add other attributes one at a time.</li></ul>`,
      worked: {
        problem: `<p>R(A,B,C,D,E) with F = {A → B, B → C, CD → E}. Compute A+ and find all candidate keys.</p>`,
        fd: `R(A,B,C,D,E)\nA->B\nB->C\nCD->E`,
        steps: [
          `<b>A+</b>: start {A}. A → B adds B → {A,B}. B → C adds C → {A,B,C}. CD → E needs D — we don't have D. Stop: <b>A+ = ABC</b>. Not all attributes → A is not a key.`,
          `Never on a right side: <b>A and D</b> → they are in every key.`,
          `<b>AD+</b>: {A,D} → B → C → (CD → E) E = ABCDE = all. AD is a superkey.`,
          `Is it minimal? A+ = ABC, D+ = D — neither alone is a superkey. And every key must contain A and D anyway. So <b>AD is the only candidate key</b>.`,
          `Prime attributes: A, D. Non-prime: B, C, E. Try it in the <i>Normalization tool</i> to see every step.`
        ]
      },
      exercises: [
        {
          id: 'm4l2e1', type: 'fd', ask: 'closure', of: 'B', level: 1, tags: ['closure'],
          prompt: `R(A,B,C,D), F = {A → B, B → C, C → D}. Compute <b>B+</b>. (Type the attributes, e.g. ABD.)`,
          problem: `R(A,B,C,D)\nA->B\nB->C\nC->D`,
          hints: ['Start with B and apply every FD whose left side you already have.', 'B → C, then C → D.'],
          solution: `B+ = {B} → C → D = <b>BCD</b>. A is not reached (no FD has A on the right).`
        },
        {
          id: 'm4l2e2', type: 'fd', ask: 'closure', of: 'AE', level: 2, tags: ['closure'],
          prompt: `R(A,B,C,D,E,F), F = {AB → C, A → D, D → B, E → F}. Compute <b>(AE)+</b>.`,
          problem: `R(A,B,C,D,E,F)\nAB->C\nA->D\nD->B\nE->F`,
          hints: ['Start {A,E}. Which FD can fire first? (AB → C cannot fire yet!)', 'A → D, then D → B, and now AB → C can fire.'],
          solution: `{A,E} → (A→D) D → (D→B) B → (AB→C) C → (E→F) F = <b>ABCDEF</b>. Order matters: AB → C only fires after B was added.`
        },
        {
          id: 'm4l2e3', type: 'fd', ask: 'keys', level: 3, tags: ['candidate-key'],
          prompt: `R(A,B,C,D), F = {AB → C, C → D, D → A}. Find <b>all candidate keys</b>. (Separate keys with commas, e.g. AB, BC.)`,
          problem: `R(A,B,C,D)\nAB->C\nC->D\nD->A`,
          hints: ['Which attribute never appears on a right side? It is in every key.', 'B alone: B+ = B. Try B with one more attribute: AB, BC, BD.'],
          solution: `B is in every key. AB+ = ABCD, BC+ = BCDA, BD+ = BDAC → <b>AB, BC, BD</b> (three candidate keys).`
        },
        {
          id: 'm4l2e4', type: 'fd', ask: 'prime', level: 3, tags: ['candidate-key'],
          prompt: `Same relation R(A,B,C,D), F = {AB → C, C → D, D → A}. Which attributes are <b>prime</b>?`,
          problem: `R(A,B,C,D)\nAB->C\nC->D\nD->A`,
          hints: ['Prime = appears in at least one candidate key. Keys: AB, BC, BD.'],
          solution: `Union of all keys = <b>ABCD</b>: every attribute is prime.`
        },
        {
          id: 'm4l2e5', type: 'fd', ask: 'keys', level: 4, tags: ['candidate-key'],
          prompt: `STUDENT_COURSE(StudentID, Course, StudentName, Instructor, Grade) with StudentID → StudentName, Course → Instructor, StudentID, Course → Grade. Find the candidate key(s). (Multi-letter names: separate attributes with commas and keys with ";")`,
          problem: `STUDENT_COURSE(StudentID, Course, StudentName, Instructor, Grade)\nStudentID -> StudentName\nCourse -> Instructor\nStudentID, Course -> Grade`,
          hints: ['Which attributes never appear on a right side?'],
          solution: `StudentID and Course never appear on a right side, and {StudentID, Course}+ = everything → the only key is <b>{StudentID, Course}</b>.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'X is a superkey of R if…', options: ['X+ contains all attributes of R', 'X appears on a left side', 'X is one attribute', 'X → X'], answer: 0, explain: 'Superkey: determines everything.' },
        { type: 'mcq', prompt: 'A candidate key is…', options: ['any superkey', 'a minimal superkey', 'the primary key only', 'a foreign key'], answer: 1, explain: 'Minimal: no proper subset is a superkey.' },
        { type: 'mcq', prompt: 'An attribute that appears on NO right-hand side…', options: ['is in no key', 'is in every candidate key', 'is non-prime', 'is derived'], answer: 1, explain: 'Nothing can determine it, so every key must contain it.' },
        { type: 'fd', ask: 'closure', of: 'C', prompt: 'R(A,B,C,D), F = {C → A, A → B}. C+ = ?', problem: 'R(A,B,C,D)\nC->A\nA->B', explain: 'C → A → B: C+ = ABC.' },
        { type: 'mcq', prompt: 'A prime attribute is one that…', options: ['is in every key', 'is in at least one candidate key', 'is a primary key alone', 'never appears in an FD'], answer: 1, explain: 'Prime = member of some candidate key.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm4l3',
      title: 'Minimal (canonical) cover',
      minutes: 20,
      intuition: `<p>A set of FDs often says the same thing twice, or uses more attributes than needed. A <b>minimal cover</b> is the "cleaned-up" version: same meaning, but no FD is redundant and no FD carries useless attributes. It is the starting point for 3NF design.</p>`,
      formal: `<ol><li><b>Split right sides</b>: every FD has a single attribute on the right (A → BC becomes A → B, A → C).</li>
<li><b>Remove extraneous left attributes</b>: in XA → B, A is extraneous if X+ (using all of F) already contains B. Then replace with X → B.</li>
<li><b>Remove redundant FDs</b>: X → A is redundant if A ∈ X+ computed <i>without</i> that FD.</li></ol>
<p>Do step 2 before step 3. A minimal cover is <b>not unique</b> — the app accepts any correct one (it checks that yours is equivalent to F and minimal).</p>`,
      worked: {
        problem: `<p>Find a minimal cover of F = {A → BC, B → C, AB → C}.</p>`,
        fd: `R(A,B,C)\nA->BC\nB->C\nAB->C`,
        steps: [
          `<b>Split</b>: A → B, A → C, B → C, AB → C.`,
          `<b>Extraneous left attributes</b> in AB → C: is B extraneous? A+ = ABC contains C, so yes → it becomes A → C (a duplicate, drop it).`,
          `<b>Redundant FDs</b>: A → C? Without it, A+ = {A,B,C} (via A → B, B → C) contains C → redundant, remove. A → B? Without it, A+ = {A,C} → needed. B → C? Without it, B+ = {B} → needed.`,
          `<b>Minimal cover: {A → B, B → C}</b>.`
        ]
      },
      exercises: [
        {
          id: 'm4l3e1', type: 'fd', ask: 'cover', level: 2, tags: ['minimal-cover'],
          prompt: `Find a minimal cover of F = {A → B, B → C, A → C}. (One FD per line or separated by ";")`,
          problem: `R(A,B,C)\nA->B\nB->C\nA->C`,
          hints: ['Right sides are already single attributes.', 'Is one FD implied by the other two (transitivity)?'],
          solution: `A → C follows from A → B and B → C → remove it. Minimal cover: <b>{A → B, B → C}</b>.`
        },
        {
          id: 'm4l3e2', type: 'fd', ask: 'cover', level: 3, tags: ['minimal-cover'],
          prompt: `Find a minimal cover of F = {AB → C, A → B, C → A}.`,
          problem: `R(A,B,C)\nAB->C\nA->B\nC->A`,
          hints: ['Check AB → C for an extraneous attribute: what is A+?', 'A+ = ABC, so B is extraneous in AB → C.'],
          solution: `AB → C → A → C (B extraneous since A → B). Then nothing is redundant: <b>{A → B, A → C, C → A}</b>.`
        },
        {
          id: 'm4l3e3', type: 'fd', ask: 'cover', level: 4, tags: ['minimal-cover'],
          prompt: `Find a minimal cover of F = {A → BC, CD → E, B → D, E → A}.`,
          problem: `R(A,B,C,D,E)\nA->BC\nCD->E\nB->D\nE->A`,
          hints: ['Split A → BC first.', 'Check CD → E: is C+ or D+ enough to get E? (C+ = C, D+ = D)'],
          solution: `Split: A → B, A → C, CD → E, B → D, E → A. No extraneous attributes (C+ = C, D+ = D). No redundant FD. Minimal cover: <b>{A → B, A → C, CD → E, B → D, E → A}</b>.`
        },
        {
          id: 'm4l3e4', type: 'mcq', level: 2, tags: ['minimal-cover'],
          prompt: `Which of these is NOT a requirement of a minimal cover?`,
          options: ['single attribute on every right side', 'no extraneous attribute on a left side', 'no redundant FD', 'single attribute on every left side'], answer: 3,
          hints: ['Left sides may have several attributes if all of them are needed.'],
          solution: `Left sides may contain several attributes (like CD → E) as long as none is extraneous.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'First step of computing a minimal cover?', options: ['remove redundant FDs', 'split right sides into single attributes', 'compute keys', 'decompose R'], answer: 1, explain: 'Split right sides first.' },
        { type: 'mcq', prompt: 'In AB → C, B is extraneous if…', options: ['B+ contains C', 'A+ contains C', 'C+ contains B', 'AB is a key'], answer: 1, explain: 'If A alone already determines C, B is not needed.' },
        { type: 'mcq', prompt: 'An FD X → A is redundant if…', options: ['A is in X+ computed without that FD', 'X is a key', 'A is prime', 'X has one attribute'], answer: 0, explain: 'The others already imply it.' },
        { type: 'mcq', prompt: 'Is the minimal cover of F unique?', options: ['Always', 'Not necessarily', 'Only for BCNF relations', 'Only with one key'], answer: 1, explain: 'Different orders of removal can give different (equivalent) covers.' },
        { type: 'fd', ask: 'cover', prompt: 'Minimal cover of {A → BC, A → B}?', problem: 'R(A,B,C)\nA->BC\nA->B', explain: 'Split A → BC; A → B appears twice → {A → B, A → C}.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm4l4',
      title: 'Anomalies and normal forms (1NF, 2NF, 3NF, BCNF)',
      minutes: 30,
      intuition: `<p>If the same fact is stored in many rows, things go wrong: change the instructor of a course and you must change 200 rows (<b>update anomaly</b>); you cannot store a new course until a student enrolls (<b>insertion anomaly</b>); delete the last student of a course and the instructor's name disappears (<b>deletion anomaly</b>). Normal forms are checklists that guarantee "one fact, one place".</p>`,
      formal: `<ul>
<li><b>1NF</b>: all attributes are atomic (no lists, no repeating groups).</li>
<li><b>2NF</b>: 1NF + no <b>partial dependency</b>: no non-prime attribute depends on <i>part</i> of a candidate key. (Only possible when a key has 2+ attributes.)</li>
<li><b>3NF</b>: for every non-trivial X → A: X is a superkey <b>or</b> A is prime. Forbids <b>transitive dependencies</b> key → X → A with A non-prime.</li>
<li><b>BCNF</b>: for every non-trivial X → A: <b>X is a superkey</b>. (Stricter: the "A is prime" escape is gone.)</li>
<li>BCNF ⟹ 3NF ⟹ 2NF ⟹ 1NF.</li>
</ul>
<p><b>Method</b>: (1) find all candidate keys and the prime attributes; (2) look for partial dependencies → if any, 1NF; (3) look for X → A with X not a superkey and A non-prime → if any, 2NF; (4) look for X → A with X not a superkey → if any, 3NF; else BCNF.</p>`,
      worked: {
        problem: `<p>STUDENT_COURSE(StudentID, Course, StudentName, Instructor, Grade) with StudentID → StudentName, Course → Instructor, {StudentID, Course} → Grade. Highest normal form? Which anomalies?</p>`,
        fd: `STUDENT_COURSE(StudentID, Course, StudentName, Instructor, Grade)\nStudentID -> StudentName\nCourse -> Instructor\nStudentID, Course -> Grade`,
        steps: [
          `Key: {StudentID, Course} (both never on a right side). Prime: StudentID, Course. Non-prime: StudentName, Instructor, Grade.`,
          `StudentID → StudentName: StudentID is <b>part</b> of the key and StudentName is non-prime → <b>partial dependency</b>. Same for Course → Instructor. → not 2NF → highest NF is <b>1NF</b>.`,
          `<b>Anomalies</b>: the instructor of a course is repeated for every student (update); a new course without students cannot be inserted (key would be incomplete: insertion); deleting the last enrollment of a course loses its instructor (deletion).`,
          `Fix (preview of the next lesson): STUDENT(StudentID, StudentName), COURSE(Course, Instructor), ENROLLMENT(StudentID, Course, Grade) — all in BCNF.`
        ]
      },
      exercises: [
        {
          id: 'm4l4e1', type: 'fd', ask: 'nf', level: 2, tags: ['partial-dependency'],
          prompt: `R(A,B,C,D) with F = {AB → D, B → C}. What is the highest normal form?`,
          problem: `R(A,B,C,D)\nAB->D\nB->C`,
          hints: ['Key: AB. Does a non-prime attribute depend on part of AB?'],
          solution: `Key AB. B → C: B is part of the key, C non-prime → partial dependency → <b>1NF</b>.`
        },
        {
          id: 'm4l4e2', type: 'fd', ask: 'nf', level: 2, tags: ['transitive-dependency'],
          prompt: `R(A,B,C,D) with F = {AB → C, C → D}. Highest normal form?`,
          problem: `R(A,B,C,D)\nAB->C\nC->D`,
          hints: ['Key: AB. Any partial dependency? A+ = A, B+ = B.', 'C → D: is C a superkey? Is D prime?'],
          solution: `Key AB, no partial dependency → 2NF. C → D: C is not a superkey and D is non-prime → <b>transitive</b> dependency (AB → C → D) → highest NF = <b>2NF</b>.`
        },
        {
          id: 'm4l4e3', type: 'fd', ask: 'nf', level: 3, tags: ['bcnf'],
          prompt: `R(A,B,C) with F = {AB → C, C → B}. Highest normal form?`,
          problem: `R(A,B,C)\nAB->C\nC->B`,
          hints: ['Find ALL candidate keys first: AB and AC.', 'C → B: C is not a superkey — but is B prime?'],
          solution: `Keys AB and AC → all attributes prime. C → B: C is not a superkey, but B is prime → allowed in 3NF, not in BCNF → <b>3NF</b>. (Classic example: Student, Course, Teacher.)`
        },
        {
          id: 'm4l4e4', type: 'fd', ask: 'nf', level: 3, tags: ['transitive-dependency'],
          prompt: `EMP_DEPT(EmpID, EmpName, DeptID, DeptName, DeptLocation) with EmpID → EmpName, DeptID and DeptID → DeptName, DeptLocation. Highest normal form?`,
          problem: `EMP_DEPT(EmpID, EmpName, DeptID, DeptName, DeptLocation)\nEmpID -> EmpName, DeptID\nDeptID -> DeptName, DeptLocation`,
          hints: ['The key is a single attribute — can there be a partial dependency?', 'EmpID → DeptID → DeptName: what kind of dependency?'],
          solution: `Key EmpID (single attribute → automatically 2NF). DeptID → DeptName: DeptID is not a superkey, DeptName non-prime → transitive → <b>2NF</b>.`
        },
        {
          id: 'm4l4e5', type: 'mcq', level: 2, tags: ['anomalies'],
          prompt: `In EMP_DEPT above, we cannot record a new department until it has an employee. This is a…`,
          options: ['update anomaly', 'insertion anomaly', 'deletion anomaly', 'join anomaly'], answer: 1,
          hints: ['We want to INSERT a department.'],
          solution: `<b>Insertion anomaly</b>: the key EmpID would be NULL for a department without employees.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'A relation whose candidate keys all have ONE attribute is automatically in at least…', options: ['1NF only', '2NF', '3NF', 'BCNF'], answer: 1, explain: 'A partial dependency needs a key with 2+ attributes.' },
        { type: 'mcq', prompt: 'A transitive dependency violates…', options: ['1NF', '2NF', '3NF', 'none'], answer: 2, explain: 'Key → X → A with A non-prime breaks 3NF.' },
        { type: 'mcq', prompt: 'BCNF requires that for every non-trivial X → A…', options: ['A is prime', 'X is a superkey', 'X is a single attribute', 'A is a key'], answer: 1, explain: 'No exceptions: every determinant is a superkey.' },
        { type: 'fd', ask: 'nf', prompt: 'R(A,B,C,D) with A → BCD and B → A. Highest NF?', problem: 'R(A,B,C,D)\nA->BCD\nB->A', explain: 'Keys A and B; both FDs have superkey left sides → BCNF.' },
        { type: 'mcq', prompt: 'Changing an instructor\'s name requires editing many rows. This is a(n)…', options: ['insertion anomaly', 'update anomaly', 'deletion anomaly', 'normal behaviour'], answer: 1, explain: 'Redundant copies must all be updated → update anomaly.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm4l5',
      title: 'Decomposition: lossless join, dependency preservation, 3NF & BCNF',
      minutes: 30,
      intuition: `<p>To fix a badly designed table we cut it into smaller tables. Two promises must hold: (1) <b>lossless</b> — joining the pieces gives back exactly the original rows, no fake rows; (2) <b>dependency preserving</b> — every rule (FD) can still be checked inside a single table. 3NF can always keep both promises; BCNF sometimes has to break the second one.</p>`,
      formal: `<ul>
<li><b>Lossless (binary test)</b>: R1, R2 is lossless iff (R1 ∩ R2) → R1 or (R1 ∩ R2) → R2, i.e. the common attributes are a key of one side.</li>
<li><b>Lossless (general)</b>: the <b>chase</b> (tableau) test — the tool shows it step by step.</li>
<li><b>Dependency preserving</b>: (F1 ∪ … ∪ Fn)+ = F+, where Fi are the FDs projected onto Ri.</li>
<li><b>3NF synthesis</b>: (1) minimal cover; (2) one relation per left side X (X ∪ all A with X → A); (3) if no relation contains a candidate key, add one with a key; (4) remove relations contained in others. Always lossless and dependency preserving.</li>
<li><b>BCNF decomposition</b>: while some Ri has X → Y with X not a superkey of Ri: replace Ri by (X ∪ Y) and (Ri − Y). Always lossless; maybe not dependency preserving.</li></ul>
<p>Type decompositions like: <code>R1(A,B), R2(B,C), R3(A,D)</code>.</p>`,
      worked: {
        problem: `<p>R(A,B,C,D,E) with F = {A → B, B → C, D → E}. Decompose into 3NF.</p>`,
        fd: `R(A,B,C,D,E)\nA->B\nB->C\nD->E`,
        decomp: `R1(A,B), R2(B,C), R3(D,E), R4(A,D)`,
        steps: [
          `<b>Minimal cover</b>: F is already minimal.`,
          `<b>Key</b>: A and D never on a right side; AD+ = ABCDE → key AD.`,
          `<b>One relation per left side</b>: R1(A,B), R2(B,C), R3(D,E).`,
          `<b>Key relation</b>: none of them contains AD → add R4(A,D).`,
          `<b>Check</b>: lossless (R4 contains a key), every FD lives inside one relation → dependency preserving. Each piece is in BCNF too. The tool below runs the chase test for this decomposition.`
        ]
      },
      exercises: [
        {
          id: 'm4l5e1', type: 'mcq', level: 1, tags: ['decomposition'],
          prompt: `R(A,B,C) with F = {A → B}. Is the decomposition R1(A,B), R2(B,C) lossless?`,
          options: ['Yes', 'No'], answer: 1,
          hints: ['Common attribute: B. Is B a key of R1 or of R2? B+ = ?'],
          solution: `R1 ∩ R2 = B, and B+ = B — B is not a key of either side → <b>lossy</b>. (R1(A,B), R2(A,C) would be lossless: A → B makes A a key of R1.)`
        },
        {
          id: 'm4l5e2', type: 'fd', ask: 'decomp3nf', level: 3, tags: ['decomposition', 'transitive-dependency'],
          prompt: `Decompose R(A,B,C,D) with F = {AB → C, C → D} into <b>3NF</b> (lossless and dependency preserving).`,
          problem: `R(A,B,C,D)\nAB->C\nC->D`,
          hints: ['One relation per left side: (A,B,C) and (C,D).', 'Does one of them contain the key AB?'],
          solution: `R1(A,B,C) with AB → C and R2(C,D) with C → D. R1 contains the key AB → lossless; both FDs are inside a relation → preserving.`
        },
        {
          id: 'm4l5e3', type: 'fd', ask: 'decomp3nf', level: 4, tags: ['decomposition', 'partial-dependency'],
          prompt: `Decompose STUDENT_COURSE(StudentID, Course, StudentName, Instructor, Grade) into 3NF.`,
          problem: `STUDENT_COURSE(StudentID, Course, StudentName, Instructor, Grade)\nStudentID -> StudentName\nCourse -> Instructor\nStudentID, Course -> Grade`,
          hints: ['Three left sides → three relations.', 'Write e.g. STUDENT(StudentID, StudentName), …'],
          solution: `STUDENT(StudentID, StudentName), COURSE(Course, Instructor), ENROLLMENT(StudentID, Course, Grade). ENROLLMENT contains the key → lossless.`
        },
        {
          id: 'm4l5e4', type: 'fd', ask: 'decompbcnf', level: 4, tags: ['bcnf', 'decomposition'],
          prompt: `Decompose R(A,B,C) with F = {AB → C, C → B} into <b>BCNF</b> (lossless).`,
          problem: `R(A,B,C)\nAB->C\nC->B`,
          hints: ['The violating FD is C → B. Split into (C ∪ B) and (R − B).'],
          solution: `R1(C,B) and R2(A,C). Lossless (common C is a key of R1). But AB → C is <b>lost</b> — it cannot be checked in one table. That's the price of BCNF.`
        },
        {
          id: 'm4l5e5', type: 'fd', ask: 'decompbcnf', level: 5, tags: ['bcnf', 'decomposition'],
          prompt: `Decompose R(A,B,C,D,E) with F = {A → BC, C → D, D → E} into <b>BCNF</b>.`,
          problem: `R(A,B,C,D,E)\nA->BC\nC->D\nD->E`,
          hints: ['Key: A. C → D violates BCNF (C is not a superkey).', 'Keep splitting until every piece has only superkey determinants.'],
          solution: `Split on C → D: C+ = CDE → R1(C,D,E), R2(A,B,C). R1 still violates (D → E): split into (D,E) and (C,D). Result: <b>(A,B,C), (C,D), (D,E)</b> — here also dependency preserving.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'A binary decomposition R1, R2 is lossless if…', options: ['R1 ∩ R2 is empty', 'R1 ∩ R2 is a key of R1 or of R2', 'R1 and R2 have the same size', 'all FDs are preserved'], answer: 1, explain: 'The common attributes must determine one whole side.' },
        { type: 'mcq', prompt: 'Which is always possible?', options: ['BCNF + dependency preserving', '3NF + lossless + dependency preserving', '4NF + preserving', 'none'], answer: 1, explain: '3NF synthesis guarantees both properties.' },
        { type: 'mcq', prompt: 'A lossy decomposition produces, after the join…', options: ['fewer rows', 'extra (spurious) rows', 'the same rows', 'an error'], answer: 1, explain: 'Spurious tuples appear — information is lost because you cannot tell real rows from fake ones.' },
        { type: 'mcq', prompt: 'In 3NF synthesis, why add a relation containing a candidate key?', options: ['for speed', 'to make the decomposition lossless', 'to reach BCNF', 'to preserve FDs'], answer: 1, explain: 'A relation with a key guarantees the lossless join.' },
        { type: 'mcq', prompt: 'R(A,B,C), F = {A → B}. R1(A,B), R2(A,C) is…', options: ['lossless', 'lossy'], answer: 0, explain: 'Common A is a key of R1 (A → B).' }
      ]
    }
  ],
  review: {
    definitions: [
      ['X → Y', 'rows equal on X are equal on Y'],
      ['Closure X+', 'all attributes determined by X'],
      ['Superkey / candidate key', 'X+ = all / minimal superkey'],
      ['Prime attribute', 'member of some candidate key'],
      ['Minimal cover', 'single RHS, no extraneous LHS attribute, no redundant FD'],
      ['2NF', 'no partial dependency of a non-prime attribute on a key'],
      ['3NF', 'every X → A: X superkey or A prime'],
      ['BCNF', 'every X → A: X superkey'],
      ['Lossless join', 'joining the pieces gives exactly R back']
    ],
    rules: [
      'Armstrong: reflexivity, augmentation, transitivity (+ union, decomposition, pseudotransitivity).',
      'Never on a right side → in every key. Only on right sides → in no key.',
      'Minimal cover: split RHS → remove extraneous LHS → remove redundant FDs.',
      'Binary lossless test: R1 ∩ R2 → R1 or R1 ∩ R2 → R2.',
      '3NF synthesis: one table per LHS + a key table if needed.',
      'BCNF split on X → Y: (X ∪ Y) and (R − Y).'
    ],
    traps: [
      'Forgetting a second candidate key → wrong prime attributes → wrong NF.',
      'Calling something 3NF without checking 2NF first.',
      'Splitting the LEFT side of an FD (AB → C does not give A → C).',
      'BCNF decomposition can lose FDs — say so in the exam!'
    ],
    example: `<p>R(A,B,C,D), AB → C, C → D. Key AB. C → D is transitive → 2NF. 3NF: R1(A,B,C), R2(C,D): lossless (R1 has the key) and preserving.</p>`
  }
});
