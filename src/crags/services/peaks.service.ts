import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Peak } from '../entities/peak.entity';
import { Crag } from '../entities/crag.entity';

export class PeaksService {
  constructor(
    @InjectRepository(Peak) private peaksRepository: Repository<Peak>,
    @InjectRepository(Crag) private cragsRepository: Repository<Crag>,
  ) {}

  async nrPeaksByCountry(countryId: string): Promise<number> {
    return this.peaksRepository.count({ where: { country: countryId } });
  }

  async getPeaks(countryId: string, areaSlug?: string): Promise<Peak[]> {
    const qb = this.peaksRepository.createQueryBuilder('peak');
    qb.leftJoin('peak.country', 'country');
    qb.where('country.id = :countryId', { countryId: countryId });

    if (areaSlug) {
      qb.leftJoin('peak.area', 'area');
      qb.andWhere('area.slug = :areaSlug', { areaSlug: areaSlug });
    }

    qb.orderBy('peak.name');

    return qb.getMany();
  }

  async getPeak(slug: string): Promise<Peak> {
    return this.peaksRepository.findOneOrFail({ slug });
  }

  async nrCragsInPeak(peakId: string): Promise<number> {
    return this.cragsRepository.count({ where: { peak: peakId } });
  }
}
