/* =====================================================================
   MODULE 3 — Relational Algebra (+ matching SQL)
   Query exercises: { type:'query', ra:'model RA', sql:'model SQL' }
   The student may answer in RA or SQL; both are run on the sample
   database (js/sampledb.js) and compared with the model result.
   ===================================================================== */
CONTENT.modules.push({
  id: 'm3',
  title: 'Relational Algebra & SQL',
  short: 'Relational Algebra',
  icon: 'σ',
  description: 'Selection, projection, joins, set operations, division and grouping — run your expressions and SQL on a real sample database.',
  lessons: [
    // ------------------------------------------------------------------
    {
      id: 'm3l1',
      title: 'Selection, projection and rename',
      minutes: 20,
      intuition: `<p>A table is like a spreadsheet. <b>Selection</b> keeps some <b>rows</b> (like a filter: "only employees in Berlin"). <b>Projection</b> keeps some <b>columns</b> (like hiding columns: "only show the names"). <b>Rename</b> just gives a new name to a table or column — handy when you use the same table twice. Every operation takes a table and returns a new table, so you can chain them like LEGO bricks.</p>`,
      formal: `<table class="t"><tr><th>Operation</th><th>Symbol</th><th>Type in this app</th><th>SQL</th></tr>
<tr><td>Selection</td><td>σ<sub>condition</sub>(R)</td><td><code>SELECT[salary>1000](EMPLOYEE)</code></td><td><code>SELECT * FROM EMPLOYEE WHERE salary > 1000</code></td></tr>
<tr><td>Projection</td><td>π<sub>A,B</sub>(R)</td><td><code>PROJECT[name, city](EMPLOYEE)</code></td><td><code>SELECT DISTINCT name, city FROM EMPLOYEE</code></td></tr>
<tr><td>Rename</td><td>ρ<sub>S(x,y)</sub>(R)</td><td><code>RENAME[E](EMPLOYEE)</code>, <code>RENAME[S(x,y)](R)</code>, <code>RENAME[name->ename](R)</code>, or <code>EMPLOYEE AS E</code></td><td><code>FROM EMPLOYEE E</code>, <code>SELECT name AS ename</code></td></tr>
</table>
<ul><li>Conditions use <code>= &lt;&gt; &lt; &lt;= &gt; &gt;=</code>, <code>AND</code>, <code>OR</code>, <code>NOT</code>; text values in quotes: <code>city='Berlin'</code>.</li>
<li>Relational algebra works with <b>sets</b>: projection removes duplicate rows. SQL keeps duplicates unless you write <b>DISTINCT</b>.</li>
<li>σ is <b>commutative</b>: σ<sub>c1</sub>(σ<sub>c2</sub>(R)) = σ<sub>c1 AND c2</sub>(R).</li></ul>
<p>The sample database (see the <i>Playground</i>) has EMPLOYEE(eid, name, salary, deptid, city, managerid), DEPARTMENT(deptid, dname, location), PROJECT(pid, pname, deptid, budget), WORKS_ON(eid, pid, hours) and the Metro Bus tables LINE, STOP, LINE_STOP, BUS, DRIVER, DRIVER_PHONE, TRIP, MAINTENANCE.</p>`,
      worked: {
        problem: `<p>Find the <b>names</b> of employees who work in department 3 and earn more than 1000.</p>`,
        steps: [
          `"Who" → which <b>rows</b>? Employees with deptid = 3 AND salary > 1000 → selection: <code>SELECT[deptid=3 AND salary>1000](EMPLOYEE)</code>.`,
          `"Names" → which <b>columns</b>? Only name → projection on top: <code>PROJECT[name](...)</code>.`,
          `Always select first, then project (otherwise salary would already be gone!).`,
          `SQL: <code>SELECT DISTINCT name FROM EMPLOYEE WHERE deptid = 3 AND salary > 1000;</code>`
        ],
        ra: `PROJECT[name](SELECT[deptid=3 AND salary>1000](EMPLOYEE))`,
        sql: `SELECT DISTINCT name FROM EMPLOYEE WHERE deptid = 3 AND salary > 1000;`
      },
      exercises: [
        {
          id: 'm3l1e1', type: 'query', level: 1, tags: ['selection-projection'],
          prompt: `List the <b>name and salary</b> of employees who earn more than 2000.`,
          ra: `PROJECT[name, salary](SELECT[salary>2000](EMPLOYEE))`,
          sql: `SELECT name, salary FROM EMPLOYEE WHERE salary > 2000;`,
          hints: ['Same pattern as the worked example: SELECT rows, then PROJECT columns.', 'Condition: salary>2000. Columns: name, salary.'],
          solution: `First keep the rows (σ salary>2000), then the columns (π name, salary).`
        },
        {
          id: 'm3l1e2', type: 'query', level: 2, tags: ['selection-projection'],
          prompt: `List all <b>cities</b> where employees live (each city once).`,
          ra: `PROJECT[city](EMPLOYEE)`,
          sql: `SELECT DISTINCT city FROM EMPLOYEE;`,
          hints: ['No condition needed — only a projection.', 'In SQL you need DISTINCT, because Berlin appears several times.'],
          solution: `Projection automatically removes duplicates in relational algebra. In SQL you must write <b>DISTINCT</b>.`
        },
        {
          id: 'm3l1e3', type: 'query', level: 2, tags: ['selection-projection'],
          prompt: `Find the names of employees who live in Berlin <b>or</b> earn less than 1000.`,
          ra: `PROJECT[name](SELECT[city='Berlin' OR salary<1000](EMPLOYEE))`,
          sql: `SELECT DISTINCT name FROM EMPLOYEE WHERE city = 'Berlin' OR salary < 1000;`,
          hints: ['Use OR inside the selection condition.', "Text values need quotes: city='Berlin'."],
          solution: `σ with OR: <code>SELECT[city='Berlin' OR salary<1000]</code>, then project name.`
        },
        {
          id: 'm3l1e4', type: 'query', level: 3, tags: ['selection-projection', 'rename'],
          prompt: `Metro Bus: list the <b>names of stops in zone 'A'</b>, renamed so that the column is called <b>stop</b>.`,
          ra: `RENAME[stopname->stop](PROJECT[stopname](SELECT[zone='A'](STOP)))`,
          sql: `SELECT stopname AS stop FROM STOP WHERE zone = 'A';`,
          hints: ['Select zone A, project stopname, then rename the column.', 'Rename a column with RENAME[old->new](R); in SQL use AS.'],
          solution: `<code>RENAME[stopname->stop](PROJECT[stopname](SELECT[zone='A'](STOP)))</code> — in SQL: <code>SELECT stopname AS stop …</code>`
        },
        {
          id: 'm3l1e5', type: 'query', level: 3, tags: ['selection-projection'],
          prompt: `Find the eid of employees who have a manager (managerid is not NULL) and live in a different city than Berlin.`,
          ra: `PROJECT[eid](SELECT[managerid IS NOT NULL AND city<>'Berlin'](EMPLOYEE))`,
          sql: `SELECT eid FROM EMPLOYEE WHERE managerid IS NOT NULL AND city <> 'Berlin';`,
          hints: ['Use IS NOT NULL (never "= NULL").', 'Different from: <>'],
          solution: `<code>SELECT[managerid IS NOT NULL AND city<>'Berlin']</code>, then project eid. Comparisons with NULL are never true — that's why SQL has IS NULL.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'Selection (σ) chooses…', options: ['columns', 'rows', 'tables', 'keys'], answer: 1, explain: 'σ filters rows using a condition; π chooses columns.' },
        { type: 'mcq', prompt: 'Which SQL keyword corresponds to projection removing duplicates?', options: ['WHERE', 'DISTINCT', 'GROUP BY', 'UNION'], answer: 1, explain: 'RA uses sets; SQL needs DISTINCT to drop duplicates.' },
        { type: 'mcq', prompt: 'What is wrong with π<sub>name</sub> then σ<sub>salary>1000</sub>: SELECT[salary>1000](PROJECT[name](EMPLOYEE))?', options: ['Nothing', 'salary no longer exists after the projection', 'You cannot nest operations', 'σ must always be outermost'], answer: 1, explain: 'After projecting only name, the salary column is gone. Select first, project last.' },
        { type: 'text', prompt: 'Write the RA for: all columns of departments located in Berlin.', keywords: [['select[', 'sigma'], ['location', 'berlin'], ['department']], sample: "SELECT[location='Berlin'](DEPARTMENT)", explain: 'Selection only, no projection needed.' },
        { type: 'mcq', prompt: 'Rename is mainly needed when…', options: ['a table is used twice in one query (self join)', 'a table has no key', 'we use aggregation', 'never'], answer: 0, explain: 'Using EMPLOYEE twice (employee and manager) needs two different names.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm3l2',
      title: 'Set operations: union, intersection, difference',
      minutes: 15,
      intuition: `<p>Set operations work like a Venn diagram on two lists: <b>UNION</b> = in either list, <b>INTERSECT</b> = in both lists, <b>MINUS</b> = in the first but not in the second. You can only compare lists that "look the same" — the same number of columns with matching types. That's called <b>union compatibility</b>.</p>`,
      formal: `<table class="t"><tr><th>Operation</th><th>Type</th><th>SQL</th></tr>
<tr><td>R ∪ S</td><td><code>R UNION S</code></td><td><code>… UNION …</code></td></tr>
<tr><td>R ∩ S</td><td><code>R INTERSECT S</code></td><td><code>… INTERSECT …</code></td></tr>
<tr><td>R − S</td><td><code>R MINUS S</code></td><td><code>… EXCEPT …</code> (Oracle: MINUS)</td></tr></table>
<ul><li><b>Union compatible</b>: same degree (number of attributes) and the i-th attributes have the same domain. Usually you need a PROJECT on both sides first.</li>
<li>∪ and ∩ are commutative; − is not (R − S ≠ S − R).</li>
<li>R ∩ S = R − (R − S).</li>
<li>"Not / never / no …" questions are usually a MINUS: (all) − (those that do).</li></ul>`,
      worked: {
        problem: `<p>Find the eid of employees who work on project 1 <b>or</b> project 3.</p>`,
        steps: [
          `Employees on project 1: <code>PROJECT[eid](SELECT[pid=1](WORKS_ON))</code>.`,
          `Employees on project 3: <code>PROJECT[eid](SELECT[pid=3](WORKS_ON))</code>.`,
          `Both are one column eid → union compatible → <code>UNION</code>.`,
          `(Here a single selection with OR would also work. UNION becomes necessary when the two parts come from different tables.)`
        ],
        ra: `PROJECT[eid](SELECT[pid=1](WORKS_ON)) UNION PROJECT[eid](SELECT[pid=3](WORKS_ON))`,
        sql: `SELECT eid FROM WORKS_ON WHERE pid = 1 UNION SELECT eid FROM WORKS_ON WHERE pid = 3;`
      },
      exercises: [
        {
          id: 'm3l2e1', type: 'query', level: 1, tags: ['set-ops'],
          prompt: `Find the eid of employees who work on project 3 <b>and</b> on project 4.`,
          ra: `PROJECT[eid](SELECT[pid=3](WORKS_ON)) INTERSECT PROJECT[eid](SELECT[pid=4](WORKS_ON))`,
          sql: `SELECT eid FROM WORKS_ON WHERE pid = 3 INTERSECT SELECT eid FROM WORKS_ON WHERE pid = 4;`,
          hints: ['Why does SELECT[pid=3 AND pid=4] give nothing? One row has only one pid!', 'Make two lists of eids and INTERSECT them.'],
          solution: `A single row cannot have pid=3 and pid=4 at the same time, so we intersect two lists: <code>π eid(σ pid=3 WORKS_ON) ∩ π eid(σ pid=4 WORKS_ON)</code>.`
        },
        {
          id: 'm3l2e2', type: 'query', level: 2, tags: ['set-ops'],
          prompt: `Find the deptid of departments that have <b>no employees</b>.`,
          ra: `PROJECT[deptid](DEPARTMENT) MINUS PROJECT[deptid](EMPLOYEE)`,
          sql: `SELECT deptid FROM DEPARTMENT EXCEPT SELECT deptid FROM EMPLOYEE;`,
          hints: ['"No" → MINUS: all departments minus departments that appear in EMPLOYEE.'],
          solution: `All deptids − deptids used by employees = {4}.`
        },
        {
          id: 'm3l2e3', type: 'query', level: 3, tags: ['set-ops', 'join-condition'],
          prompt: `Metro Bus: give the <b>firstname and lastname</b> of drivers who have <b>never</b> driven a trip.`,
          ra: `PROJECT[firstname, lastname]((PROJECT[driverid](DRIVER) MINUS PROJECT[driverid](TRIP)) NATURALJOIN DRIVER)`,
          sql: `SELECT firstname, lastname FROM DRIVER WHERE driverid NOT IN (SELECT driverid FROM TRIP);`,
          hints: ['First find the driverids: all drivers MINUS drivers in TRIP.', 'Twist: the names are not in that result — join it back with DRIVER, then project.'],
          solution: `MINUS works on ids; then <b>join back</b> to get other columns: <code>π firstname,lastname((π driverid(DRIVER) − π driverid(TRIP)) ⋈ DRIVER)</code>. Note: you cannot do π firstname,lastname,driverid(DRIVER) − π driverid(TRIP) — not union compatible!`
        },
        {
          id: 'm3l2e4', type: 'query', level: 3, tags: ['set-ops'],
          prompt: `Find the <b>names</b> that are either an employee name or a department name (one column).`,
          ra: `PROJECT[name](EMPLOYEE) UNION PROJECT[dname](DEPARTMENT)`,
          sql: `SELECT name FROM EMPLOYEE UNION SELECT dname FROM DEPARTMENT;`,
          hints: ['Both sides must have exactly one text column.'],
          solution: `π name(EMPLOYEE) ∪ π dname(DEPARTMENT). The column names differ, but both are text with degree 1 → union compatible. The result keeps the left name.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'R(a,b) and S(c) are…', options: ['union compatible', 'not union compatible (different degree)', 'compatible only for MINUS', 'compatible only for INTERSECT'], answer: 1, explain: 'Different number of attributes → not union compatible.' },
        { type: 'mcq', prompt: 'SQL keyword for relational difference (standard SQL)?', options: ['MINUS', 'EXCEPT', 'DIFF', 'NOT'], answer: 1, explain: 'Standard SQL uses EXCEPT; Oracle calls it MINUS.' },
        { type: 'mcq', prompt: 'R ∩ S can be written as…', options: ['R − (R − S)', 'R ∪ S', 'S − R', 'R × S'], answer: 0, explain: 'Remove from R what is not in S → what remains is in both.' },
        { type: 'mcq', prompt: 'Is R − S = S − R?', options: ['Always', 'Never', 'Not in general', 'Only if R is empty'], answer: 2, explain: 'Difference is not commutative.' },
        { type: 'text', prompt: 'Which set operation do "never / not / no" questions usually need?', keywords: [['minus', 'difference', 'except']], sample: 'MINUS (difference)', explain: 'All − those that do = those that never do.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm3l3',
      title: 'Joins: cartesian product, theta, equi, natural, outer',
      minutes: 30,
      intuition: `<p>Information is spread over several tables: the employee knows only the department <i>number</i>, the department table knows the <i>name</i>. A <b>join</b> glues rows together that belong together. The cartesian product glues <i>every</i> row with <i>every</i> row (mostly nonsense); a join is a product that keeps only the matching pairs. An <b>outer join</b> also keeps the rows that found no partner, filling the gaps with NULL.</p>`,
      formal: `<table class="t"><tr><th>Operation</th><th>Type</th><th>SQL</th></tr>
<tr><td>Cartesian product R × S</td><td><code>R TIMES S</code></td><td><code>FROM R, S</code> / <code>CROSS JOIN</code></td></tr>
<tr><td>Theta join R ⋈<sub>θ</sub> S = σ<sub>θ</sub>(R × S)</td><td><code>R JOIN[cond] S</code></td><td><code>R JOIN S ON cond</code></td></tr>
<tr><td>Equi join (θ uses only =)</td><td><code>EMPLOYEE JOIN[EMPLOYEE.deptid=DEPARTMENT.deptid] DEPARTMENT</code></td><td><code>… ON E.deptid = D.deptid</code></td></tr>
<tr><td>Natural join R * S</td><td><code>R NATURALJOIN S</code></td><td><code>R NATURAL JOIN S</code></td></tr>
<tr><td>Left / right / full outer</td><td><code>R LEFTJOIN[cond] S</code>, <code>RIGHTJOIN</code>, <code>FULLJOIN</code></td><td><code>LEFT/RIGHT/FULL OUTER JOIN … ON</code></td></tr></table>
<ul><li>|R × S| = |R| · |S| rows; degree = degree(R) + degree(S).</li>
<li><b>Natural join</b> joins on <b>all</b> attributes with the same name and keeps one copy of them. Dangerous when tables share a name by accident!</li>
<li>Qualify ambiguous attributes: <code>EMPLOYEE.deptid</code>, or rename tables: <code>EMPLOYEE AS e</code> then <code>e.deptid</code>.</li>
<li>Left outer join keeps <b>all rows of the left</b> table; unmatched → NULLs on the right.</li></ul>`,
      worked: {
        problem: `<p>List every employee's <b>name with the name of their department</b>.</p>`,
        steps: [
          `Name is in EMPLOYEE, dname is in DEPARTMENT → we need a join.`,
          `Matching condition: the employee's deptid equals the department's deptid → equi join <code>EMPLOYEE JOIN[EMPLOYEE.deptid=DEPARTMENT.deptid] DEPARTMENT</code>.`,
          `Project the two columns we want: <code>PROJECT[name, dname](…)</code>.`,
          `Hugo has deptid NULL → no partner → not in the result (an inner join drops him). A LEFTJOIN would keep him with dname NULL.`
        ],
        ra: `PROJECT[name, dname](EMPLOYEE JOIN[EMPLOYEE.deptid=DEPARTMENT.deptid] DEPARTMENT)`,
        sql: `SELECT e.name, d.dname FROM EMPLOYEE e JOIN DEPARTMENT d ON e.deptid = d.deptid;`
      },
      exercises: [
        {
          id: 'm3l3e1', type: 'query', level: 1, tags: ['join-condition'],
          prompt: `List each project's <b>pname</b> with the <b>location</b> of the department that controls it.`,
          ra: `PROJECT[pname, location](PROJECT NATURALJOIN DEPARTMENT)`,
          sql: `SELECT p.pname, d.location FROM PROJECT p JOIN DEPARTMENT d ON p.deptid = d.deptid;`,
          hints: ['PROJECT and DEPARTMENT share exactly one column name: deptid. A natural join is safe here.', 'Or: PROJECT JOIN[PROJECT.deptid=DEPARTMENT.deptid] DEPARTMENT.'],
          solution: `<code>PROJECT[pname, location](PROJECT NATURALJOIN DEPARTMENT)</code> — natural join on deptid.`
        },
        {
          id: 'm3l3e2', type: 'query', level: 2, tags: ['join-condition'],
          prompt: `Metro Bus: list each <b>linename</b> together with the <b>stopname</b> and the <b>stoporder</b> of its stops.`,
          ra: `PROJECT[linename, stoporder, stopname](LINE NATURALJOIN LINE_STOP NATURALJOIN STOP)`,
          sql: `SELECT l.linename, ls.stoporder, s.stopname FROM LINE l JOIN LINE_STOP ls ON l.lineno = ls.lineno JOIN STOP s ON ls.stopid = s.stopid;`,
          hints: ['Three tables: LINE – LINE_STOP – STOP.', 'Join LINE with LINE_STOP on lineno, then with STOP on stopid.'],
          solution: `The M:N table LINE_STOP sits in the middle: LINE ⋈ LINE_STOP ⋈ STOP, then project.`
        },
        {
          id: 'm3l3e3', type: 'query', level: 3, tags: ['natural-join-trap', 'join-condition'],
          prompt: `Find the <b>names of employees who work on the project 'Zeus'</b>. Careful: EMPLOYEE and PROJECT both have a column deptid!`,
          ra: `PROJECT[name](EMPLOYEE JOIN[EMPLOYEE.eid=WORKS_ON.eid] (WORKS_ON JOIN[WORKS_ON.pid=PROJECT.pid] SELECT[pname='Zeus'](PROJECT)))`,
          sql: `SELECT DISTINCT e.name FROM EMPLOYEE e JOIN WORKS_ON w ON e.eid = w.eid JOIN PROJECT p ON w.pid = p.pid WHERE p.pname = 'Zeus';`,
          hints: ['Try EMPLOYEE NATURALJOIN WORKS_ON NATURALJOIN PROJECT and compare: Anna is missing! Why?', 'The natural join also forces EMPLOYEE.deptid = PROJECT.deptid. Use explicit join conditions on eid and pid instead (or project PROJECT to pid first).'],
          solution: `A natural join over all three tables also equates <b>deptid</b>, so it only finds employees working on projects of <i>their own</i> department — Anna (dept 1) on Zeus (dept 3) is lost. Use explicit conditions: join on eid and on pid only. Alternative: <code>PROJECT[name](EMPLOYEE NATURALJOIN (WORKS_ON NATURALJOIN PROJECT[pid](SELECT[pname='Zeus'](PROJECT))))</code>.`
        },
        {
          id: 'm3l3e4', type: 'query', level: 4, tags: ['rename', 'join-condition'],
          prompt: `Self join: list each employee's <b>name</b> together with the <b>name of their manager</b>.`,
          ra: `PROJECT[e.name, m.name](EMPLOYEE AS e JOIN[e.managerid=m.eid] EMPLOYEE AS m)`,
          sql: `SELECT e.name, m.name FROM EMPLOYEE e JOIN EMPLOYEE m ON e.managerid = m.eid;`,
          hints: ['You need EMPLOYEE twice: once as the employee (e), once as the manager (m).', 'Condition: the employee\'s managerid equals the manager\'s eid.'],
          solution: `Rename the two copies (e and m) and join on <code>e.managerid = m.eid</code>. Without RENAME, "name" would be ambiguous.`
        },
        {
          id: 'm3l3e5', type: 'query', level: 4, tags: ['outer-join'],
          prompt: `List <b>every department name</b> with the names of its employees — <b>including</b> departments without employees (show NULL there).`,
          ra: `PROJECT[dname, name](DEPARTMENT LEFTJOIN[DEPARTMENT.deptid=EMPLOYEE.deptid] EMPLOYEE)`,
          sql: `SELECT d.dname, e.name FROM DEPARTMENT d LEFT JOIN EMPLOYEE e ON d.deptid = e.deptid;`,
          hints: ['"including departments without …" → outer join that keeps all DEPARTMENT rows.', 'DEPARTMENT is on the left → LEFTJOIN.'],
          solution: `A <b>left outer join</b> keeps HR (no employees) with name = NULL. An inner join would drop it.`
        },
        {
          id: 'm3l3e6', type: 'query', level: 5, tags: ['join-condition', 'selection-projection'],
          prompt: `Metro Bus: give the <b>plate</b> of buses that were used on the line named 'Airport Express' (each plate once).`,
          ra: `PROJECT[plate](BUS NATURALJOIN TRIP NATURALJOIN SELECT[linename='Airport Express'](LINE))`,
          sql: `SELECT DISTINCT b.plate FROM BUS b JOIN TRIP t ON b.busid = t.busid JOIN LINE l ON t.lineno = l.lineno WHERE l.linename = 'Airport Express';`,
          hints: ['Path: BUS – TRIP – LINE.', 'Select the line by its name first (smaller intermediate result).'],
          solution: `BUS ⋈ TRIP ⋈ σ linename='Airport Express'(LINE), then π plate. Pushing the selection down before the join is exactly what a query optimizer does.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'R has 4 rows, S has 3 rows. How many rows does R × S have?', options: ['7', '12', '4', '3'], answer: 1, explain: 'Every row with every row: 4·3 = 12.' },
        { type: 'mcq', prompt: 'A theta join R ⋈θ S equals…', options: ['σθ(R × S)', 'πθ(R × S)', 'R ∪ S', 'R − S'], answer: 0, explain: 'Product, then keep the pairs that satisfy θ.' },
        { type: 'mcq', prompt: 'A natural join joins on…', options: ['the primary keys', 'all attributes with the same name', 'the first column', 'any condition you give'], answer: 1, explain: 'All common attribute names must be equal — watch out for accidental common names!' },
        { type: 'mcq', prompt: 'To keep employees without a department in the result (EMPLOYEE on the left) use…', options: ['inner join', 'left outer join', 'right outer join', 'natural join'], answer: 1, explain: 'Left outer keeps all rows of the left table.' },
        { type: 'text', prompt: 'Write the join condition (plain text) to connect TRIP with DRIVER.', keywords: [['trip.driverid', 't.driverid', 'driverid'], ['driver.driverid', 'd.driverid', '=']], sample: 'TRIP.driverid = DRIVER.driverid', explain: 'FK in TRIP = PK in DRIVER.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm3l4',
      title: 'Division: "for all" questions',
      minutes: 20,
      intuition: `<p>Division answers questions with the words <b>"all"</b> or <b>"every"</b>: "which students passed <i>all</i> courses?". Picture a stamp card: the divisor is the list of all stamps you need, the dividend lists which stamps each person has. Division returns the people whose card is <b>complete</b>.</p>`,
      formal: `<ul><li><b>R(X, Y) ÷ S(Y)</b> = the X values that appear in R together with <b>every</b> Y value of S. Type: <code>R DIVIDE S</code>.</li>
<li>All attributes of S must be in R. The result has the attributes of R that are not in S.</li>
<li>Prepare both sides with PROJECT: the dividend should be exactly (X, Y), the divisor exactly (Y).</li>
<li>With basic operators: R ÷ S = π<sub>X</sub>(R) − π<sub>X</sub>((π<sub>X</sub>(R) × S) − R).</li>
<li>SQL has no DIVIDE; use double NOT EXISTS ("there is no required item that this person does not have"), or GROUP BY … HAVING COUNT(*) = (SELECT COUNT(*) …).</li></ul>`,
      worked: {
        problem: `<p>Find the eid of employees who work on <b>all</b> projects.</p>`,
        steps: [
          `Dividend: who works on what → <code>PROJECT[eid, pid](WORKS_ON)</code> (drop hours! otherwise the dividend has an extra attribute).`,
          `Divisor: all projects → <code>PROJECT[pid](PROJECT)</code>.`,
          `Divide: <code>PROJECT[eid, pid](WORKS_ON) DIVIDE PROJECT[pid](PROJECT)</code> → only Eva (105) has all four projects.`,
          `SQL "double negation": employees for whom <i>no</i> project exists that they do <i>not</i> work on.`
        ],
        ra: `PROJECT[eid, pid](WORKS_ON) DIVIDE PROJECT[pid](PROJECT)`,
        sql: `SELECT e.eid FROM EMPLOYEE e WHERE NOT EXISTS (SELECT * FROM PROJECT p WHERE NOT EXISTS (SELECT * FROM WORKS_ON w WHERE w.eid = e.eid AND w.pid = p.pid));`
      },
      exercises: [
        {
          id: 'm3l4e1', type: 'query', level: 2, tags: ['division'],
          prompt: `Find the eid of employees who work on <b>all projects of department 3</b>.`,
          ra: `PROJECT[eid, pid](WORKS_ON) DIVIDE PROJECT[pid](SELECT[deptid=3](PROJECT))`,
          sql: `SELECT w.eid FROM WORKS_ON w JOIN PROJECT p ON w.pid = p.pid WHERE p.deptid = 3 GROUP BY w.eid HAVING COUNT(DISTINCT w.pid) = (SELECT COUNT(*) FROM PROJECT WHERE deptid = 3);`,
          hints: ['Same as the worked example, but the divisor contains only the projects of department 3.'],
          solution: `Divisor = π pid(σ deptid=3 (PROJECT)) = {3, 4}. Employees 105 and 106 work on both.`
        },
        {
          id: 'm3l4e2', type: 'query', level: 3, tags: ['division'],
          prompt: `Metro Bus: find the driverid of drivers who have driven on <b>every line</b>.`,
          ra: `PROJECT[driverid, lineno](TRIP) DIVIDE PROJECT[lineno](LINE)`,
          sql: `SELECT d.driverid FROM DRIVER d WHERE NOT EXISTS (SELECT * FROM LINE l WHERE NOT EXISTS (SELECT * FROM TRIP t WHERE t.driverid = d.driverid AND t.lineno = l.lineno));`,
          hints: ['Dividend: (driverid, lineno) from TRIP. Divisor: all lineno.'],
          solution: `<code>PROJECT[driverid, lineno](TRIP) DIVIDE PROJECT[lineno](LINE)</code> → driver 1.`
        },
        {
          id: 'm3l4e3', type: 'query', level: 4, tags: ['division', 'join-condition'],
          prompt: `Same question, but return the <b>firstname and lastname</b> of those drivers.`,
          ra: `PROJECT[firstname, lastname]((PROJECT[driverid, lineno](TRIP) DIVIDE PROJECT[lineno](LINE)) NATURALJOIN DRIVER)`,
          sql: `SELECT d.firstname, d.lastname FROM DRIVER d WHERE NOT EXISTS (SELECT * FROM LINE l WHERE NOT EXISTS (SELECT * FROM TRIP t WHERE t.driverid = d.driverid AND t.lineno = l.lineno));`,
          hints: ['Division gives only ids. Join the result back with DRIVER, then project the names.'],
          solution: `Divide first, then <b>join back</b> to DRIVER: never put firstname/lastname into the dividend (it would still work here, but it is a bad habit when names are not unique).`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'Which words in a question suggest division?', options: ['"at least one"', '"all / every"', '"none"', '"the maximum"'], answer: 1, explain: '"for all" → division.' },
        { type: 'mcq', prompt: 'R(A,B) ÷ S(B) has the attributes…', options: ['A', 'B', 'A, B', 'none'], answer: 0, explain: 'R\'s attributes minus S\'s attributes.' },
        { type: 'mcq', prompt: 'Why project WORKS_ON to (eid, pid) before dividing by projects?', options: ['to make it faster only', 'because the extra column hours would become part of the answer and break the "all" logic', 'because division needs keys', 'it is not needed'], answer: 1, explain: 'The dividend must contain exactly X and Y; otherwise hours is treated as part of X.' },
        { type: 'mcq', prompt: 'In SQL, division is usually written with…', options: ['DIVIDE', 'double NOT EXISTS (or COUNT comparison)', 'UNION', 'LEFT JOIN'], answer: 1, explain: 'SQL has no division operator.' },
        { type: 'text', prompt: 'Complete: R ÷ S = π_X(R) − π_X(( π_X(R) × S ) − ? )', keywords: [['r']], exact: ['r'], sample: 'R', explain: '(π_X(R) × S) − R are the "missing combinations"; remove their X values.' }
      ]
    },
    // ------------------------------------------------------------------
    {
      id: 'm3l5',
      title: 'Aggregation, grouping and query trees',
      minutes: 25,
      intuition: `<p>Sometimes we don't want the rows themselves but a <b>summary</b>: how many, total, average, smallest, largest. <b>Grouping</b> first sorts the rows into piles (one pile per department), then the aggregate function summarises each pile. Big queries are easier when written <b>step by step</b> with temporary results — and a <b>query tree</b> draws the same thing: leaves are tables, inner nodes are operations, the root is the answer.</p>`,
      formal: `<ul><li>Aggregation γ: <code>GROUP[deptid; COUNT(*) AS n, AVG(salary) AS avgsal](EMPLOYEE)</code> = SQL <code>SELECT deptid, COUNT(*) AS n, AVG(salary) AS avgsal FROM EMPLOYEE GROUP BY deptid</code>.</li>
<li>Functions: COUNT, SUM, AVG, MIN, MAX. Without grouping attributes: <code>GROUP[; COUNT(*) AS n](R)</code> → one row.</li>
<li>Condition on a group (SQL <b>HAVING</b>) = a selection <i>after</i> the grouping: <code>SELECT[avgsal>1500](GROUP[...](...))</code>.</li>
<li><b>Assignment</b> for step-by-step expressions: <code>T1 &lt;- SELECT[...](...)</code> on its own line; the last line is the answer.</li>
<li><b>Query tree</b>: build it bottom-up. Good practice: push selections and projections <b>down</b> (as early as possible) to make intermediate results small.</li></ul>`,
      worked: {
        problem: `<p>For each department, how many employees does it have and what is their average salary?</p>`,
        steps: [
          `"For each department" → group by deptid.`,
          `"How many" → COUNT(*); "average salary" → AVG(salary).`,
          `<code>GROUP[deptid; COUNT(*) AS n, AVG(salary) AS avgsal](EMPLOYEE)</code>.`,
          `Notice the group with deptid NULL (Hugo): both RA grouping and SQL GROUP BY put NULLs together in one group.`,
          `Query tree (try the "Tree" button in the playground): γ at the root, EMPLOYEE as the leaf.`
        ],
        ra: `GROUP[deptid; COUNT(*) AS n, AVG(salary) AS avgsal](EMPLOYEE)`,
        sql: `SELECT deptid, COUNT(*) AS n, AVG(salary) AS avgsal FROM EMPLOYEE GROUP BY deptid;`
      },
      exercises: [
        {
          id: 'm3l5e1', type: 'query', level: 1, tags: ['aggregation'],
          prompt: `For each project (pid), compute the <b>total hours</b> worked on it.`,
          ra: `GROUP[pid; SUM(hours) AS total](WORKS_ON)`,
          sql: `SELECT pid, SUM(hours) AS total FROM WORKS_ON GROUP BY pid;`,
          hints: ['Group by pid, aggregate SUM(hours).'],
          solution: `<code>GROUP[pid; SUM(hours) AS total](WORKS_ON)</code>`
        },
        {
          id: 'm3l5e2', type: 'query', level: 2, tags: ['aggregation'],
          prompt: `Find the deptid of departments whose <b>average salary is above 1500</b>, together with that average.`,
          ra: `SELECT[avgsal>1500](GROUP[deptid; AVG(salary) AS avgsal](EMPLOYEE))`,
          sql: `SELECT deptid, AVG(salary) AS avgsal FROM EMPLOYEE GROUP BY deptid HAVING AVG(salary) > 1500;`,
          hints: ['First compute the average per department, then select on it.', 'In SQL a condition on an aggregate goes in HAVING, not WHERE.'],
          solution: `Grouping first, then σ avgsal>1500 (= HAVING). WHERE filters rows <i>before</i> grouping; HAVING filters groups <i>after</i>.`
        },
        {
          id: 'm3l5e3', type: 'query', level: 3, tags: ['aggregation', 'join-condition'],
          prompt: `Metro Bus: for each driver <b>firstname</b>, count the number of trips they drove (only drivers with at least one trip).`,
          ra: `GROUP[firstname; COUNT(*) AS trips](DRIVER NATURALJOIN TRIP)`,
          sql: `SELECT d.firstname, COUNT(*) AS trips FROM DRIVER d JOIN TRIP t ON d.driverid = t.driverid GROUP BY d.firstname;`,
          hints: ['Join DRIVER and TRIP, then group by firstname.'],
          solution: `<code>GROUP[firstname; COUNT(*) AS trips](DRIVER NATURALJOIN TRIP)</code> (in real life group by driverid too, because two drivers could share a first name).`
        },
        {
          id: 'm3l5e4', type: 'query', level: 4, tags: ['query-tree', 'join-condition'],
          prompt: `Step by step: find the <b>names of employees of the department located in Paris</b> who work <b>more than 10 hours</b> on some project. Use assignments like <code>T1 &lt;- …</code> (one per line).`,
          ra: `T1 <- PROJECT[deptid](SELECT[location='Paris'](DEPARTMENT))
T2 <- PROJECT[eid, name](EMPLOYEE NATURALJOIN T1)
T3 <- PROJECT[eid](SELECT[hours>10](WORKS_ON))
PROJECT[name](T2 NATURALJOIN T3)`,
          sql: `SELECT DISTINCT e.name FROM EMPLOYEE e JOIN DEPARTMENT d ON e.deptid = d.deptid WHERE d.location = 'Paris' AND e.eid IN (SELECT eid FROM WORKS_ON WHERE hours > 10);`,
          hints: ['T1: the deptid of the Paris department.', 'T2: employees of that department. T3: eids with hours > 10.', 'Finish with a join of T2 and T3 and a projection.'],
          solution: `<pre>T1 <- PROJECT[deptid](SELECT[location='Paris'](DEPARTMENT))
T2 <- PROJECT[eid, name](EMPLOYEE NATURALJOIN T1)
T3 <- PROJECT[eid](SELECT[hours>10](WORKS_ON))
PROJECT[name](T2 NATURALJOIN T3)</pre>Clara and David (Sales, Paris) both have more than 10 hours.`
        },
        {
          id: 'm3l5e5', type: 'query', level: 5, tags: ['aggregation', 'query-tree'],
          prompt: `Find the <b>name and salary</b> of the employee(s) with the <b>highest salary</b>. (Twist: combine aggregation with a join.)`,
          ra: `T1 <- GROUP[; MAX(salary) AS salary](EMPLOYEE)
PROJECT[name, salary](EMPLOYEE NATURALJOIN T1)`,
          sql: `SELECT name, salary FROM EMPLOYEE WHERE salary = (SELECT MAX(salary) FROM EMPLOYEE);`,
          hints: ['First compute MAX(salary) with an empty grouping list: GROUP[; MAX(salary) AS salary](EMPLOYEE).', 'Naming the aggregate "salary" lets a natural join find the matching employee.'],
          solution: `Compute the maximum, then join it back: the natural join matches on the column "salary". In SQL: a subquery in WHERE.`
        }
      ],
      quiz: [
        { type: 'mcq', prompt: 'A condition on an aggregate (e.g. AVG(salary) > 1500) in SQL goes in…', options: ['WHERE', 'HAVING', 'ORDER BY', 'FROM'], answer: 1, explain: 'HAVING filters groups after aggregation.' },
        { type: 'mcq', prompt: 'COUNT(*) counts…', options: ['distinct values', 'rows in each group (including NULLs)', 'only non-NULL values', 'columns'], answer: 1, explain: 'COUNT(*) counts rows; COUNT(col) ignores NULLs in col.' },
        { type: 'mcq', prompt: 'In a query tree the leaves are…', options: ['operations', 'base relations (tables)', 'the final result', 'conditions'], answer: 1, explain: 'Leaves = tables; inner nodes = operations; root = result.' },
        { type: 'mcq', prompt: 'A good heuristic for optimisation is…', options: ['do selections as late as possible', 'push selections and projections down the tree', 'always use cartesian products', 'avoid joins'], answer: 1, explain: 'Filtering early makes intermediate results small.' },
        { type: 'text', prompt: 'Write the RA (this app\'s syntax) for: number of employees per city.', keywords: [['group['], ['city'], ['count(']], sample: 'GROUP[city; COUNT(*) AS n](EMPLOYEE)', explain: 'Group by city, COUNT(*).' }
      ]
    }
  ],
  review: {
    definitions: [
      ['σ selection', 'keeps rows: SELECT[cond](R) — SQL WHERE'],
      ['π projection', 'keeps columns, removes duplicates: PROJECT[a,b](R) — SQL SELECT DISTINCT'],
      ['ρ rename', 'RENAME[S](R), R AS S — SQL aliases'],
      ['∪ ∩ −', 'UNION, INTERSECT, MINUS — need union-compatible inputs'],
      ['× / ⋈', 'TIMES = all pairs; JOIN[cond] = σcond(R×S); NATURALJOIN on all same-named attributes'],
      ['Outer joins', 'LEFTJOIN / RIGHTJOIN / FULLJOIN keep unmatched rows with NULLs'],
      ['÷ division', '"for all": R(X,Y) DIVIDE S(Y)'],
      ['γ aggregation', 'GROUP[a; COUNT(*) AS n](R) — SQL GROUP BY / HAVING']
    ],
    rules: [
      'Select first, project last.',
      '"and" across different rows → INTERSECT (or join), not AND in one selection.',
      '"never / no" → MINUS. "all / every" → DIVIDE.',
      'After MINUS or DIVIDE on ids, join back to get names.',
      'Condition on a group → selection after GROUP (SQL HAVING).'
    ],
    traps: [
      'Natural join on accidental common names (deptid in EMPLOYEE and PROJECT).',
      'Ambiguous attributes after a join — qualify them (e.deptid) or rename.',
      'Projecting away a column you still need for a later selection.',
      'Forgetting DISTINCT in SQL when RA would remove duplicates.',
      'Using = NULL instead of IS NULL.'
    ],
    example: `<p><b>Names of employees working on all projects of department 3:</b><br><code>T1 &lt;- PROJECT[eid,pid](WORKS_ON) DIVIDE PROJECT[pid](SELECT[deptid=3](PROJECT))</code><br><code>PROJECT[name](T1 NATURALJOIN EMPLOYEE)</code> → Eva, Felix</p>`
  }
});
