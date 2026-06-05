// Khai báo cho TypeScript hiểu định dạng file CSS khi import trực tiếp
declare module "*.css" {
  const content: any;
  export default content;
}
