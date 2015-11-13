package net.e2.bw.servicereg.core.rest;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Used for pagination of search results
 */
public class PagedResult<T> implements Serializable {

    List<T> content = new ArrayList<>();
    long totalElements;
    int size;

    /**
     * Paginates a content list according to the page number and size
     * @param content the list to paginate
     * @param page the page number
     * @param size the page size
     * @return the paged result
     */
    public static <T> PagedResult<T> paginate(List<T> content, int page, int size) {
        return paginate(content, page, size, null);
    }

    /**
     * Paginates a content list according to the page number and size
     * @param content the list to paginate
     * @param page the page number
     * @param size the page size
     * @param comparator the comparator
     * @return the paged result
     */
    public static <T> PagedResult<T> paginate(List<T> content, int page, int size, Comparator<T> comparator) {
        return paginate(content, page, size, null, comparator);
    }

    /**
     * Paginates a content list according to the page number and size
     * @param content the list to paginate
     * @param page the page number
     * @param size the page size
     * @param filter an optional filter
     * @param comparator the comparator
     * @return the paged result
     */
    public static <T> PagedResult<T> paginate(List<T> content, int page, int size, Predicate<T> filter, Comparator<T> comparator) {
        PagedResult<T> result = new PagedResult<>();
        if (content != null) {
            result.setTotalElements(content.size());

            Stream<T> stream = content.stream();
            if (filter != null) {
                stream = stream.filter(filter);
            }
            if (comparator != null) {
                stream = stream.sorted(comparator);
            }
            result.setContent(stream
                    .skip(page * size)
                    .limit(size)
                    .collect(Collectors.toList()));
        }
        result.setSize(size);
        return result;
    }

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}
