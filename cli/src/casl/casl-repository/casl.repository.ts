import { Injectable } from '@nestjs/common';
import { ICaslRepository } from './icasl-repository.interface';

@Injectable()
export class CaslRepository implements ICaslRepository {}
