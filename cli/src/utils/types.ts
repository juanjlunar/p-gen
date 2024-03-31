import { DBPermission } from '../casl/types';
import { Operation } from './enums/json-diff.enum';

export type FlatChange = {
  type: Operation;
  key: string;
  path: string;
  valueType: string | null;
  value?: DBPermission;
  oldValue?: DBPermission;
};

export type HashAlg = 'sha256';
