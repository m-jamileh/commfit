export class PaginationQueryDto {
  cursor?: string;
  limit: number = 50;
}

export class PaginatedResponseDto<T> {
  data: T[];
  nextCursor: string | undefined;
  total: number;

  constructor(data: T[], nextCursor: string | undefined, total: number) {
    this.data = data;
    this.nextCursor = nextCursor;
    this.total = total;
  }
}
