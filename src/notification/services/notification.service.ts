import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Crag } from '../../crags/entities/crag.entity';
import { Route } from '../../crags/entities/route.entity';
import { Sector } from '../../crags/entities/sector.entity';
import { ClubMember } from '../../users/entities/club-member.entity';
import { User } from '../../users/entities/user.entity';
import { MailService } from './mail.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailService: MailService,
    private configService: ConfigService,
  ) {}

  public async accountConfirmation(user: User): Promise<boolean> {
    return this.mailService
      .send({
        to: user.email,
        subject: 'Aktivacija računa',
        template: 'account-confirmation',
        templateParams: {
          user: user,
          userGender: {
            unknown: !user.gender || user.gender === 'O',
            female: user.gender && user.gender === 'F',
          },
          url:
            this.configService.get('WEB_URL') +
            'aktivacija/' +
            user.id +
            '/' +
            user.confirmationToken,
        },
      })
      .then(() => true)
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  public async contributionRejection(
    contribution: { crag?: Crag; sector?: Sector; route?: Route },
    user: User,
    admin: User,
    message: string,
  ): Promise<boolean> {
    let contribitionName = '';

    if (contribution.crag != null) {
      contribitionName = `Plezališče ${contribution.crag.name}`;
    } else if (contribution.sector != null) {
      contribitionName = `Sektor ${contribution.sector.name}`;
    } else {
      contribitionName = `Smer ${contribution.route.name}`;
    }

    return this.mailService
      .send({
        from: admin.email,
        to: user.email,
        subject: `Prispevek zavrnjen: ${contribitionName}`,
        template: 'contribution-rejection',
        templateParams: {
          user,
          contribution,
          message,
          userGender: {
            unknown: !user.gender || user.gender === 'O',
            female: user.gender && user.gender === 'F',
          },
        },
      })
      .then(() => true)
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  public async passwordRecovery(user: User): Promise<boolean> {
    return this.mailService
      .send({
        to: user.email,
        subject: 'Povezava za spremembo gesla',
        template: 'password-recovery',
        templateParams: {
          user: user,
          userGender: {
            unknown: !user.gender || user.gender === 'O',
            female: user.gender && user.gender === 'F',
          },
          url:
            this.configService.get('WEB_URL') +
            'menjava-gesla/' +
            user.id +
            '/' +
            user.passwordToken,
        },
      })
      .then(() => true)
      .catch(() => false);
  }

  public async clubMembershipConfirmation(
    userAdding: User, // user that triggered the action of adding a new member to the club
    clubMember: ClubMember, // new member user-club relation
  ): Promise<boolean> {
    const clubMemberUser = await clubMember.user;
    const club = await clubMember.club;
    const webUrl = this.configService.get('WEB_URL');

    return this.mailService
      .send({
        to: clubMemberUser.email,
        subject: 'Potrdi članstvo v klubu',
        template: 'club-membership-confirmation',
        templateParams: {
          userAdding: userAdding,
          userAddingGender: {
            unknown: !userAdding.gender || userAdding.gender === 'O',
            female: userAdding.gender && userAdding.gender === 'F',
          },
          clubMemberUser: clubMemberUser,
          clubMemberUserGender: {
            unknown: !clubMemberUser.gender || clubMemberUser.gender === 'O',
            female: clubMemberUser.gender && clubMemberUser.gender === 'F',
            male: clubMemberUser.gender && clubMemberUser.gender === 'M',
          },
          club: club,
          webUrl: webUrl,
          confirmationUrl:
            webUrl +
            'potrditev-clanstva/' +
            clubMember.id +
            '/' +
            clubMember.confirmationToken,
        },
      })
      .then(() => true)
      .catch(() => false);
  }
}
