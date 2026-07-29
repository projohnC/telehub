import {
  FaStepBackward,
  FaStepForward,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

const range = (start, end) => {
  return [...Array(end - start).keys()].map((el) => el + start);
};

const getPagesCut = ({ pagesCount, pagesCutCount, currentPage }) => {
  const ceiling = Math.ceil(pagesCutCount / 2);
  const floor = Math.floor(pagesCutCount / 2);

  if (pagesCount <= pagesCutCount) {
    return { start: 1, end: pagesCount + 1 };
  } else if (currentPage <= ceiling) {
    return { start: 1, end: pagesCutCount + 1 };
  } else if (currentPage + floor >= pagesCount) {
    return { start: pagesCount - pagesCutCount + 1, end: pagesCount + 1 };
  } else {
    return {
      start: currentPage - ceiling + 1,
      end: currentPage + floor + 1,
    };
  }
};

const PaginationItem = ({ page, currentPage, onPageChange, isDisabled }) => {
  return !isDisabled ? (
    <button
      className={
        page === Number(currentPage)
          ? "border-none w-10 h-10 flex items-center justify-center text-sm font-bold bg-[#E50914] text-white rounded-full transition-all duration-300 ease-in-out cursor-pointer hover:opacity-90 active:scale-95"
          : "border-none w-10 h-10 flex items-center justify-center text-sm font-bold bg-[#1f1f1f] text-white/80 rounded-full transition-all duration-300 ease-in-out cursor-pointer hover:bg-white/10 active:scale-95"
      }
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  ) : null;
};

const Pagination = ({ currentPage, total, limit, onPageChange, pagesNum }) => {
  const pagesCount = Math.ceil(total / limit); // Calculate total number of pages
  const pagesCut = getPagesCut({ pagesCount, pagesCutCount: 5, currentPage });
  const pages = range(pagesCut.start, pagesCut.end);

  const isFirstPage = Number(currentPage) === 1;
  const isLastPage = Number(currentPage) === pagesCount;

  return (
    <ul className="flex items-center gap-2 flex-wrap mt-6">
      <PaginationItem
        page={<FaStepBackward className="text-xs" />}
        currentPage={Number(currentPage)}
        onPageChange={() => onPageChange(1)}
        isDisabled={isFirstPage}
      />
      <PaginationItem
        page={<FaArrowLeft className="text-xs" />}
        currentPage={Number(currentPage)}
        onPageChange={() => onPageChange(Number(currentPage) - 1)}
        isDisabled={isFirstPage}
      />
      {pages.map((page) => (
        <PaginationItem
          page={page}
          key={page}
          currentPage={Number(currentPage)}
          onPageChange={onPageChange}
        />
      ))}
      <PaginationItem
        page={<FaArrowRight className="text-xs" />}
        currentPage={Number(currentPage)}
        onPageChange={() => onPageChange(Number(currentPage) + 1)}
        isDisabled={isLastPage}
      />
      <PaginationItem
        page={<FaStepForward className="text-xs" />}
        currentPage={Number(currentPage)}
        onPageChange={() => onPageChange(pagesNum)}
        isDisabled={isLastPage}
      />
    </ul>
  );
};

export default Pagination;

