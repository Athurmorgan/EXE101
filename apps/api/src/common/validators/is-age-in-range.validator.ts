import {
  registerDecorator,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidationOptions,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { USER_MAX_AGE, USER_MIN_AGE } from '@vivivu/shared';

/**
 * Kiem tra ngay sinh nằm trong khoang tuoi cho phep.
 *
 * Doc ngay sinh chu khong doc so tuoi de tranh loi kinh dien "18 tuoi cua
 * nam ngoai ra bat 36 nam moi..." — tuoi duoc tinh lai tu `dateOfBirth` o
 * moi lan doc.
 *
 * Implement `ValidatorConstraintInterface` (khong phai `ValidatorConstraint` —
 * cai do la decorator factory, khong phai interface).
 */
@ValidatorConstraint({ name: 'isAgeInRange', async: false })
export class IsAgeInRangeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    const birth = toDate(value);
    if (birth === null) return false;

    const now = new Date();
    // Tuoi chi doi 1 lan moi nam — tinh theo "da qua sinh nhat chua", vi du
    // sinh 31/12, den thang 1 van chua duoi 1 tuoi.
    const age = now.getFullYear() - birth.getFullYear();
    const hadBirthdayThisYear =
      now.getMonth() > birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());

    const years = hadBirthdayThisYear ? age : age - 1;
    return years >= USER_MIN_AGE && years <= USER_MAX_AGE;
  }

  defaultMessage(args: ValidationArguments): string {
    if (toDate(args.value) === null) return 'Date of birth is invalid';
    return `You must be between ${USER_MIN_AGE} and ${USER_MAX_AGE} years old`;
  }
}

/** Chuyen value thanh `Date` hop le, tra `null` neu khong doc duoc. */
function toDate(value: unknown): Date | null {
  // `null` / `undefined` = field optional, hop le.
  if (value === null || value === undefined) return null;

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  // Chi chap nhan chuoi hoac so. Khong dung `String(value)` tren `unknown` vi
  // object se ra `"[object Object]"` — ngam nhi la ngay hop le roi tu choi o
  // `IsDate` kiem tra truoc, error se ra "khong ro nguyen nhan".
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * `@IsAgeInRange()` — tuong thich `null` / `undefined` vi ngay sinh la optional.
 *
 * Ten ham co `chữ hoa` dau vi dung nhu decorator: `@IsAgeInRange()`. Quy tac
 * `naming-convention` cua ESLint chi chan ham, nen file nay duoc danh sach
 * ngoai le — dong nay la ly do.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsAgeInRange(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol): void => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsAgeInRangeConstraint,
    });
  };
}
