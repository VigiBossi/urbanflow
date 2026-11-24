/* =====================================================================
   CONTENT — shared parts: weak-point categories and common name aliases.
   Module files (m1.js ... m4.js) push their module into CONTENT.modules.
   ===================================================================== */
window.CONTENT = {
  modules: [],

  // Weak-point categories. key -> label shown in the tracker
  categories: {
    'er-concepts': 'ER concepts (entities, attributes, relationships)',
    'er-missing-entity': 'Missed an entity in the story',
    'er-missing-relationship': 'Missed a relationship',
    'missing-attribute': 'Forgot an attribute',
    'attribute-misplaced': 'Attribute attached to the wrong entity',
    'weak-entity-notation': 'Weak entity / identifying relationship not marked',
    'weak-entity-key': 'Forgot weak entity key (owner PK + partial key)',
    'missing-key': 'Missing or wrong key attribute',
    'multivalued-notation': 'Multivalued attribute not drawn as double oval',
    'derived-notation': 'Derived attribute not drawn as dashed oval',
    'composite': 'Composite attribute not modelled correctly',
    'attribute-type': 'Wrong attribute type',
    'cardinality': 'Wrong cardinality (1:1, 1:N, M:N)',
    'participation': 'Wrong participation (total vs partial)',
    'rel-attr-misplaced': 'Relationship attribute put on an entity',
    'chen-symbols': 'Chen symbols',
    'composite-not-split': 'Composite attribute not split into parts',
    'derived-stored': 'Derived attribute stored in a table',
    'multivalued-not-split': 'Multivalued not split into its own table',
    'missing-table': 'Missing table',
    'missing-fk': 'Missing foreign key',
    'pk-wrong': 'Wrong primary key',
    'fk-wrong-side-1to1': 'FK on wrong side in 1:1',
    'fk-wrong-side-1toN': 'FK on wrong side in 1:N',
    'mn-not-table': 'M:N relationship not turned into a table',
    'mn-key': 'Wrong primary key in M:N table',
    'mapping-rules': 'ERD-to-schema mapping rules',
    'selection-projection': 'Selection vs projection',
    'rename': 'Rename / aliases',
    'set-ops': 'Set operations & union compatibility',
    'join-condition': 'Wrong join condition',
    'natural-join-trap': 'Natural join joined on too many columns',
    'outer-join': 'Outer joins',
    'division': 'Division ("for all" questions)',
    'aggregation': 'Aggregation & grouping',
    'query-tree': 'Query trees & nested expressions',
    'sql-syntax': 'SQL translation',
    'fd-basics': 'Functional dependencies & Armstrong\'s axioms',
    'closure': 'Attribute closure',
    'candidate-key': 'Candidate keys / prime attributes',
    'minimal-cover': 'Minimal cover',
    'anomalies': 'Insertion / update / deletion anomalies',
    'partial-dependency': 'Missed partial dependency (2NF)',
    'transitive-dependency': 'Missed transitive dependency (3NF)',
    'bcnf': 'BCNF',
    'decomposition': 'Lossless join & dependency preservation'
  },

  // Synonyms accepted everywhere when checking ERDs and schemas
  aliases: {
    Phone: ['PhoneNumber', 'PhoneNo', 'Telephone', 'Tel', 'Mobile'],
    ZIP: ['ZipCode', 'PostalCode', 'PostCode', 'Zip'],
    FirstName: ['FName', 'GivenName', 'First'],
    LastName: ['LName', 'Surname', 'FamilyName', 'Last'],
    DOB: ['DateOfBirth', 'BirthDate', 'BDate', 'Birthday'],
    DateOfBirth: ['DOB', 'BirthDate', 'BDate'],
    BirthDate: ['DOB', 'DateOfBirth', 'BDate'],
    Street: ['StreetName', 'StreetAddress'],
    Name: ['FullName'],
    Salary: ['Wage', 'Pay'],
    Email: ['EmailAddress', 'Mail', 'EMail']
  }
};
