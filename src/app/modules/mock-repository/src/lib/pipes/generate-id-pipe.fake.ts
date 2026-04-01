export class GenerateIdPipeFake {
  transform(value: string): string {
    return value.concat((100 * Math.random()).toFixed(0));
  }
}
