import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IBlog } from 'app/shared/model/blog/blog.model';
import { BlogService } from './blog.service';
import { BlogDeleteDialogComponent } from './blog-delete-dialog.component';

@Component({
  selector: 'jhi-blog',
  templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit, OnDestroy {
  blogs: IBlog[];
  eventSubscriber: Subscription;
  currentSearch: string;

  constructor(
    protected blogService: BlogService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll() {
    if (this.currentSearch) {
      this.blogService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IBlog[]>) => (this.blogs = res.body));
      return;
    }
    this.blogService.query().subscribe((res: HttpResponse<IBlog[]>) => {
      this.blogs = res.body;
      this.currentSearch = '';
    });
  }

  search(query) {
    if (!query) {
      return this.clear();
    }
    this.currentSearch = query;
    this.loadAll();
  }

  clear() {
    this.currentSearch = '';
    this.loadAll();
  }

  ngOnInit() {
    this.loadAll();
    this.registerChangeInBlogs();
  }

  ngOnDestroy() {
    this.eventManager.destroy(this.eventSubscriber);
  }

  trackId(index: number, item: IBlog) {
    return item.id;
  }

  registerChangeInBlogs() {
    this.eventSubscriber = this.eventManager.subscribe('blogListModification', () => this.loadAll());
  }

  delete(blog: IBlog) {
    const modalRef = this.modalService.open(BlogDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.blog = blog;
  }
}
