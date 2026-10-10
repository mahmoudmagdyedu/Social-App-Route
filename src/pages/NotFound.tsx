import { Link } from "react-router";
import { EmptyState } from "../components/Status";
const NotFound = () => (
  <>
    <EmptyState
      title="الصفحة دي مش موجودة"
      text="يمكن الرابط اتغير. ارجع للحكايات وكمّل من هناك."
    />
    <Link className="btn-primary mt-5" to="/">
      الرجوع للرئيسية
    </Link>
  </>
);
export default NotFound;
