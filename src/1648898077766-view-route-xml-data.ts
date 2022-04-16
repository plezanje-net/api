import { BadGatewayException } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { XMLParser } from 'fast-xml-parser';

export class viewRouteXmlData1648898077766 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const parser = new XMLParser({ ignoreAttributes: false });
    const summary = {
      crags: [],
      routes: [],
      areas: [],
      peaks: [],
      iceFalls: [],
    };

    const entities = [
      {
        query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM peak`,
        name: 'peaks',
      },
      {
        query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM "ice_fall"`,
        name: 'iceFalls',
      },
      {
        query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM area`,
        name: 'areas',
      },
      {
        query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM route`,
        name: 'routes',
      },
      {
        query: `SELECT id, legacy::json -> 'XmlInfo' as xmlinfo FROM crag`,
        name: 'crags',
      },
    ];

    let query;

    for (const entity of entities) {
      query = await queryRunner.query(entity.query);

      query.forEach(async row => {
        if (row.xmlinfo == null) return;
        const result = parser.parse(row.xmlinfo);
        Object.keys(result).forEach(propertyName => {
          if (propertyName != 'extGrade') return;
          if (summary[entity.name][propertyName] == null) {
            summary[entity.name][propertyName] = [];
          }
          if (
            !summary[entity.name][propertyName].includes(result[propertyName])
          ) {
            summary[entity.name][propertyName].push(result[propertyName]);
          }
        });
      });
    }

    console.log(
      Object.keys(summary).map(key => ({
        entity: key,
        properties: Object.keys(summary[key]),
      })),
    );
    console.log(summary.iceFalls);

    throw BadGatewayException;
  }

  public async down(): Promise<void> {}
}
