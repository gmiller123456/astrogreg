#!/user/bin/perl
use strict;

while(my $l=<>){
    $l=~s/\r*\n*//gis;
    my @v=split(/\,/g,$l);
    print "[ $v[0], \"$v[1]\", \"$v[2]\", $v[3]],\r\n";
}