import { Test, TestingModule } from '@nestjs/testing';
import { SectorsService } from './sectors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sector } from '../entities/sector.entity';
import { Repository } from 'typeorm';
import { MockType, repositoryMockFactory } from '../../../test/unit/helpers';
import { Crag } from '../entities/crag.entity';
import { CreateSectorInput } from '../dtos/create-sector.input';

describe('SectorsService', () => {
  let service: SectorsService
  let sectorsRepositoryMock: MockType<Repository<Sector>>
  let cragsRepositoryMock: MockType<Repository<Crag>>
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectorsService,
        { provide: getRepositoryToken(Sector), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(Crag), useFactory: repositoryMockFactory },
      ],
    }).compile();

    service = module.get<SectorsService>(SectorsService)
    
    sectorsRepositoryMock = module.get(getRepositoryToken(Sector))
    cragsRepositoryMock = module.get(getRepositoryToken(Crag))
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  });

  it('should find sector by crag id', async () => {
    const returnedSector: Sector = <Sector> <unknown> {}
    const cragId: string = 'cragId'
    sectorsRepositoryMock.find.mockReturnValue(returnedSector)

    expect(await service.findByCrag(cragId)).toEqual(returnedSector)
    expect(sectorsRepositoryMock.find).toBeCalledWith({
      where: {
        crag: cragId,
      },
    })
  })

  it('should create new sector for provided crag id', async () => {
    const returnedSector: Sector = <Sector> <unknown> {}
    const inputData: CreateSectorInput = <CreateSectorInput> <unknown> {
      cragId: 'cragId',
    }
    const returnedCrag: Crag = <Crag> <unknown> {}
    const sector = new Sector();
    cragsRepositoryMock.findOneOrFail.mockReturnValue(returnedCrag)
    sectorsRepositoryMock.save.mockReturnValue(returnedSector)

    expect(await service.create(inputData)).toEqual(returnedSector)
    expect(cragsRepositoryMock.findOneOrFail).toBeCalledWith(inputData.cragId)
    expect(sectorsRepositoryMock.save).toBeCalledWith({
      ...sector,
      crag: Promise.resolve(returnedCrag)
    })
  })
});
