import { XMLParser } from 'fast-xml-parser';
import { MigrationInterface, QueryRunner } from 'typeorm';

const transferData = async queryRunner => {
  const parser = new XMLParser({ ignoreAttributes: false });
  const summary = {
    peaks: [],
    crags: [],
    routes: [],
    iceFalls: [],
  };

  const entities = [
    {
      query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM "peak"`,
      name: 'peaks',
      mapping: [['PeakDescription', 'copy', 'peak', 'description', '']],
    },
    {
      query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM "ice_fall"`,
      name: 'iceFalls',
      table: 'ice_fall_property',
      field: 'iceFallId',
      mapping: [
        ['extGrade', 'create', 'property', 'extGrade', 'Težavnost', 'string'],
        ['lref', 'create', 'book', ''],
        [
          'FirstClimb',
          'create',
          'property',
          'firstAscent',
          'Prvi preplezali',
          'string',
        ],
        ['access', 'create', 'property', 'access', 'Dostop', 'text'],
        [
          'ClimbTime',
          'create',
          'property',
          'avgClimbTime',
          'Povprečni čas',
          'string',
        ],
        ['accessURL', 'create', 'property', 'accessURL', 'Dostop', 'url'],
        [
          'descriptionURL',
          'create',
          'property',
          'descriptionURL',
          'Vodniček',
          'url',
        ],
        [
          'ExitHeigth',
          'create',
          'property',
          'exitHeight',
          'Nadmorska višina (m)',
          'number',
        ],
        ['photoURL', 'create', 'property', 'photoURL', 'Fotografija', 'url'],
        ['sketchURL', 'create', 'property', 'sketchURL', 'Skica', 'url'],
        [
          'equipment',
          'create',
          'property',
          'equipment',
          'Potrebna oprema',
          'text',
        ],
        ['descent', 'create', 'property', 'descent', 'Sestop', 'text'],
      ],
    },
    {
      query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM route`,
      name: 'routes',
      table: 'route_property',
      field: 'routeId',
      mapping: [
        [
          'ExtRouteDiff',
          'create',
          'property',
          'extGrade',
          'Težavnost',
          'string',
        ],
        ['description', 'copy', 'route', 'description', ''],
        [
          'protComment',
          'create',
          'property',
          'protection',
          'Opremljenost',
          'text',
        ],
        [
          'rope',
          'create',
          'property',
          'ropeLength',
          'Dolžina vrvi (m)',
          'string',
        ],
        [
          'komplet',
          'create',
          'property',
          'nrQuickdraws',
          'Število kompletov',
          'number',
        ],
        ['access', 'create', 'property', 'routeAccess', 'Vstop', 'text'],
        ['lref', 'create', 'book', ''],
        [
          'ClimbTime',
          'create',
          'property',
          'climbTime',
          'Čas plezanja',
          'string',
        ],
        [
          'descriptionURL',
          'create',
          'property',
          'descriptionURL',
          'Vodniček',
          'url',
        ],
        ['accessURL', 'create', 'property', 'accessURL', 'Dostop', 'url'],
        [
          'ExitHeigth',
          'create',
          'property',
          'exitHeight',
          'Nadmorska višina izstopa (m)',
          'number',
        ],
        ['photoURL', 'create', 'property', 'photoURL', 'Fotografija', 'url'],
        ['klin', 'create', 'property', 'nrWedges', 'Število klinov', 'number'],
        ['sketchURL', 'create', 'property', 'sketchURL', 'Skica', 'url'],
        ['descent', 'create', 'property', 'descent', 'Sestop', 'text'],
        ['lb', 'create', 'property', 'routeNr', 'Številka smeri', 'number'],
        ['trv', 'create', 'property', 'traverse', 'Prečka', 'boolean'],
        ['sit', 'create', 'property', 'sitStart', 'Sedeči start', 'boolean'],
        [
          'camelot',
          'create',
          'property',
          'nrCamelots',
          'Število metuljev',
          'number',
        ],
        ['zatic', 'create', 'property', 'nrNuts', 'Število zatičev', 'number'],
      ],
    },
    {
      query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM crag`,
      name: 'crags',
      table: 'crag_property',
      field: 'cragId',
      mapping: [
        ['Area', 'create', 'property', 'area', 'Področje', 'string'],
        [
          'descriptionURL',
          'create',
          'property',
          'descriptionURL',
          'Vodniček',
          'url',
        ],
        ['sketchURL', 'create', 'property', 'sketchURL', 'Skica', 'url'],
        ['accessURL', 'create', 'property', 'accessURL', 'Dostop', 'url'],
        ['photoURL', 'create', 'property', 'photoURL', 'Fotografija', 'url'],
        [
          'accessTime',
          'create',
          'property',
          'accessTime',
          'Trajanje dostopa',
          'string',
        ],
      ],
    },
  ];

  let query;

  const propertyTypes = {};
  const mapping = {};
  let pos = 1;

  const bookRefs = {};

  const books = await queryRunner.query(
    `SELECT id, legacy::json -> 'RefID' as refid FROM book`,
  );
  books.forEach(row => {
    bookRefs[row.refid] = row.id;
  });

  for (const entity of entities) {
    // create property types
    for (const mr of entity.mapping) {
      if (mr[2] == 'property') {
        if (propertyTypes[mr[3]] == undefined) {
          await queryRunner.query(
            `INSERT INTO property_type (id, name, "valueType", position) VALUES ('${mr[3]}', '${mr[4]}', '${mr[5]}', ${pos})`,
          );
          propertyTypes[mr[3]] = true;
          pos++;
        }
        mapping[`${entity.name}-${mr[0]}`] = mr;
      }
      if (mr[1] == 'copy') {
        mapping[`${entity.name}-${mr[0]}`] = mr;
      }
      if (mr[2] == 'book') {
        mapping[`${entity.name}-${mr[0]}`] = mr;
      }
    }

    query = await queryRunner.query(entity.query);

    query.forEach(async row => {
      if (row.xmlinfo == null) return;
      const result = parser.parse(row.xmlinfo);
      Object.keys(result).forEach(async propertyName => {
        if (summary[entity.name][propertyName] == null) {
          summary[entity.name][propertyName] = [];
        }
        if (
          !summary[entity.name][propertyName].includes(result[propertyName])
        ) {
          summary[entity.name][propertyName].push(result[propertyName]);
        }

        if (mapping[`${entity.name}-${propertyName}`] != null) {
          const mr = mapping[`${entity.name}-${propertyName}`];

          const valueField =
            mr[5] == 'time' || mr[5] == 'number'
              ? 'numValue'
              : mr[5] == 'text'
              ? 'textValue'
              : 'stringValue';
          let value = result[propertyName];
          let author = '';

          if (mr[2] == 'book') {
            if (bookRefs[value] != null) {
              const table = entity.table.replace('_property', '_books_book');
              await queryRunner.query(
                `INSERT INTO ${table} ("${entity.field}", "bookId") VALUES ($1, $2)`,
                [row.id, bookRefs[value]],
              );
            }
            return;
          }

          if (propertyName == 'ExtRouteDiff') {
            value = value.comp_grade || value.comp;
          }

          if (typeof value == 'object') {
            if (value['@_author'] != null) {
              author = value['@_author'];
            }
            value = value['#text'];
          }

          if (mr[1] == 'copy' || mr[5] == 'text') {
            value = bbconv(value + '');
          }

          if (mr[1] == 'copy') {
            await queryRunner.query(
              `UPDATE ${mr[2]} SET "${mr[3]}" = $1 WHERE id = $2`,
              [value, row.id],
            );
            return;
          }

          if (mr[5] == 'number') {
            value = (value + '').replace(',', '.');
          }
          if (mr[5] == 'boolean') {
            await queryRunner.query(
              `INSERT INTO ${entity.table} ("propertyTypeId", "${entity.field}", position) VALUES ('${mr[3]}', '${row.id}', 0)`,
            );
          } else if (author != '') {
            await queryRunner.query(
              `INSERT INTO ${entity.table} ("propertyTypeId", "${entity.field}", "${valueField}", author, position) VALUES ($1, $2, $3, $4, 0)`,
              [mr[3], row.id, value, author],
            );
          } else {
            await queryRunner.query(
              `INSERT INTO ${entity.table} ("propertyTypeId", "${entity.field}", "${valueField}", position) VALUES ($1, $2, $3, 0)`,
              [mr[3], row.id, value],
            );
          }
        }
      });
    });
  }
};

const bbconv = (str: string) => {
  const regs = [
    {
      f: /\[b\](.*?)\[\/b\]/gm,
      r: '<b>$1</b>',
    },
    {
      f: /\[i\](.*?)\[\/i\]/gm,
      r: '<i>$1</i>',
    },
    {
      f: /\[u\](.*?)\[\/u\]/gm,
      r: '<span class="text-decoration: underline;">$1</span>',
    },
    {
      f: /\[img\](.*?)\[\/img\]/gm,
      r: '<a href="$1" target="_blank" class="image-url">$1</a>',
    },
    {
      f: /\[url\](.*?)\[\/url\]/gm,
      r: '<a href="$1">$1</a>',
    },
    {
      f: /[\n]/gm,
      r: '<br>',
    },
    {
      f: /\[\/img\]/gm,
      r: '',
    },
    {
      f: /\[img\]/gm,
      r: '',
    },
    {
      f: /\[linkref\=(.*?)\](.*?)\[\/linkref\]/gm,
      r: '<a href="$1">$2</a>',
    },
    {
      f: ':wink:',
      r: '😉',
    },
    {
      f: ':evil:',
      r: '😈',
    },
    {
      f: ':!:',
      r: '❗',
    },
    {
      f: ':?:',
      r: '❓',
    },
    {
      f: ':)',
      r: '🙂',
    },
    {
      f: ':-)',
      r: '🙂',
    },
    {
      f: ':(',
      r: '🙁',
    },
    {
      f: ':D',
      r: '😀',
    },
    {
      f: ':c:',
      r: '',
    },
  ];

  for (let reg of regs) {
    str = str.replace(reg.f, reg.r);
  }

  return str;
};

export class entityProperties1650621348999 implements MigrationInterface {
  name = 'entityProperties1650621348999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."crag_status_idx"`);
    await queryRunner.query(
      `CREATE TABLE "property_type" ("id" character varying NOT NULL, "name" character varying NOT NULL, "valueType" character varying NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_eb483bf7f6ddf612998949edd26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "crag_property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propertyTypeId" character varying NOT NULL, "stringValue" character varying, "textValue" text, "numValue" double precision, "author" character varying, "position" integer NOT NULL, "cragId" uuid NOT NULL, CONSTRAINT "PK_d414146bbed4c0b8020f21e148a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ice_fall_property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propertyTypeId" character varying NOT NULL, "stringValue" character varying, "textValue" text, "numValue" double precision, "author" character varying, "position" integer NOT NULL, "iceFallId" uuid NOT NULL, CONSTRAINT "PK_0bf749953f28a25fb6ea488a759" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "route_property" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propertyTypeId" character varying NOT NULL, "stringValue" character varying, "textValue" text, "numValue" double precision, "author" character varying, "position" integer NOT NULL, "routeId" uuid NOT NULL, CONSTRAINT "PK_16c6f93060060e829760e662f1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "route" ADD "description" text`);

    await queryRunner.query(
      `ALTER TABLE "crag_property" ADD CONSTRAINT "FK_0c46cfe4ccdba50f112025d4bba" FOREIGN KEY ("propertyTypeId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" ADD CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef" FOREIGN KEY ("cragId") REFERENCES "crag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" ADD CONSTRAINT "FK_969f93aa39edbfb362506fd079f" FOREIGN KEY ("propertyTypeId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" ADD CONSTRAINT "FK_5127725de08e04ec7682162fa97" FOREIGN KEY ("iceFallId") REFERENCES "ice_fall"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" ADD CONSTRAINT "FK_0f46edec1a9d828cd4cdc7162d2" FOREIGN KEY ("propertyTypeId") REFERENCES "property_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" ADD CONSTRAINT "FK_ed7327e8c601718e963cdc655a1" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "ice_fall_books_book" ("iceFallId" uuid NOT NULL, "bookId" uuid NOT NULL, CONSTRAINT "PK_1868c1fc424d4a390c6a50e19be" PRIMARY KEY ("iceFallId", "bookId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_afa30f83400020b8dbc39427b4" ON "ice_fall_books_book" ("iceFallId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66929c6c9ca3967f29e1ec54d8" ON "ice_fall_books_book" ("bookId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "route_books_book" ("routeId" uuid NOT NULL, "bookId" uuid NOT NULL, CONSTRAINT "PK_ad1c994e8caf2023746e093e7e0" PRIMARY KEY ("routeId", "bookId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9916ebe855f6ee1fe71a47c28e" ON "route_books_book" ("routeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30867690ac76920e8d7434a9e8" ON "route_books_book" ("bookId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" ADD CONSTRAINT "FK_afa30f83400020b8dbc39427b46" FOREIGN KEY ("iceFallId") REFERENCES "ice_fall"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" ADD CONSTRAINT "FK_66929c6c9ca3967f29e1ec54d83" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" ADD CONSTRAINT "FK_9916ebe855f6ee1fe71a47c28ee" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" ADD CONSTRAINT "FK_30867690ac76920e8d7434a9e84" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(`ALTER TABLE "ice_fall" DROP COLUMN "access"`);

    await transferData(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "route_property" DROP CONSTRAINT "FK_ed7327e8c601718e963cdc655a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_property" DROP CONSTRAINT "FK_0f46edec1a9d828cd4cdc7162d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" DROP CONSTRAINT "FK_5127725de08e04ec7682162fa97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_property" DROP CONSTRAINT "FK_969f93aa39edbfb362506fd079f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" DROP CONSTRAINT "FK_66aa9b1be26f87337745c8c82ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crag_property" DROP CONSTRAINT "FK_0c46cfe4ccdba50f112025d4bba"`,
    );
    await queryRunner.query(`ALTER TABLE "route" DROP COLUMN "description"`);

    await queryRunner.query(`DROP TABLE "route_property"`);
    await queryRunner.query(`DROP TABLE "ice_fall_property"`);
    await queryRunner.query(`DROP TABLE "crag_property"`);
    await queryRunner.query(`DROP TABLE "property_type"`);
    await queryRunner.query(
      `CREATE INDEX "crag_status_idx" ON "crag" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" DROP CONSTRAINT "FK_30867690ac76920e8d7434a9e84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_books_book" DROP CONSTRAINT "FK_9916ebe855f6ee1fe71a47c28ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" DROP CONSTRAINT "FK_66929c6c9ca3967f29e1ec54d83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ice_fall_books_book" DROP CONSTRAINT "FK_afa30f83400020b8dbc39427b46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30867690ac76920e8d7434a9e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9916ebe855f6ee1fe71a47c28e"`,
    );
    await queryRunner.query(`DROP TABLE "route_books_book"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66929c6c9ca3967f29e1ec54d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_afa30f83400020b8dbc39427b4"`,
    );
    await queryRunner.query(`DROP TABLE "ice_fall_books_book"`);
    await queryRunner.query(`ALTER TABLE "ice_fall" ADD "access" text`);
  }
}
