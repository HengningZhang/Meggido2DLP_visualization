#Import Flask Library
from flask import Flask, render_template, request, session, url_for, redirect
import pymysql.cursors
import datetime
import json

#Initialize the app from Flask
app = Flask(__name__)

@app.route('/')
def main():
    return render_template('main.html')

@app.route('/get_constraints', methods=['GET', 'POST'])
def get_constraints():
    data = json.loads(request.args.get('data'))
    print(data)
    return jsonify(result=True)

def process_input(pair_of_points):
    constraints=[]
    for ((x1,y1),(x2,y2)) in pair_of_points:
        a=(y2-y1)/(x2-x1)
        b=y1-a*x1
        constraints.append((a,b))
    return constraints

def calculate_intersection(line1,line2):
    x=(line2[1]-line1[1])/(line1[0]-line2[0])
    y=line1[0]*x+line1[1]
    return (x,y)

def discard_from_pairs(pairs,side):
    return remaining_pairs

class Megiddo:
    
    def __init__(self,upper_constraints,lower_constraints):
        self.upper_constraints=upper_constraints
        self.lower_constraints=lower_constraints
        self.remaining_lower_constraints=[]
        self.pairs=[]
        self.optimal_point=None
        self.optimal_line=None
    
    def pair_constraints(self):
        for i in range(0,len(self.lower_constraints),2):
            if i+1<constraints:
                self.pairs.append((calculate_intersection(self.lower_constraints[i],self.lower_constraints[i+1]),self.lower_constraints[i],self.lower_constraints[i+1]))
            else:
                self.remaining_lower_constraints.append(self.upper_constraints[i])
    
    def select_median_intersection_x(self):
        intersections_x=[pair[0][0] for pair in self.pairs]
        return median(intersections[0])

    def test_line(self,x):
        
        bottom_upper_constraint=(float('inf'),(0,0))
        top_lower_constraint=(float('-inf'),(0,0))
        for (a,b) in self.upper_constraints:
            if a*x+b<bottom_upper_constraint[0]:
                bottom_upper_constraint=(a*x+b,(a,b))
        for (a,b) in self.lower_constraints:
            if a*x+b>top_lower_constraint[0]:
                top_lower_constraint=(a*x+b,(a,b))
        #what if top/bottom is an intersection?
        return top_lower_constraint, bottom_upper_constraint

    def discard_from_pairs(self,x,left_right):
        #discard half on the left side if left_right == True, vise versa
        if left_right:
            for pair in self.pairs:
                if pair[0][0]<x:
                    if pair[1][0]<pair[2][0]:
                        self.remaining_lower_constraints.append(pair[2])
                    else:
                        self.remaining_lower_constraints.append(pair[1])
        else:
            for pair in self.pairs:
                if pair[0][0]>x:
                    if pair[1][0]>pair[2][0]:
                        self.remaining_lower_constraints.append(pair[2])
                    else:
                        self.remaining_lower_constraints.append(pair[1])
        self.lower_constraints=self.remaining_lower_constraints
        self.remaining_lower_constraints.clear()

    def brute_force(self):
        intersections=[]
        for i in range(len(self.constraints)):
            for j in range(i,len(self.constraints)):
                intersection.append(calculate_intersection(self.constraints[i],self.constraints[j]))


    def step(self):
        if self.optimal_point!=None or self.optimal_line!=None:
            return False
        if self.lower_constraints<6:
            self.brute_force()
        self.pair_constraints()
        x=self.select_median_intersection_x()
        top_lower_constraint,bottom_upper_constraint = self.test_line(x)
        if bottom_upper_constraint[0]>top_lower_constraint[0]:
            #in feasible region
            if top_lower_constraint[1][0]>0:
                #optimal point on left
                self.discard_from_pairs(x,False)
            elif top_lower_constraint[1][0]<0:
                #optimal point on right
                self.discard_from_pairs(x,True)
            else:
                self.optimal_line=top_lower_constraint
        else:
            #not in feasible region
            if bottom_upper_constraint[1][0]==top_lower_constraint[1][0]:
                #no feasible region exist
                return False
            elif bottom_upper_constraint[1][0]>top_lower_constraint[1][0]:
                #optimal point maybe on right
                self.discard_from_pairs(x,True)
            else:
                #optimal point maybe on left
                self.discard_from_pairs(x,False)
        


if __name__ == "__main__":
    app.run('127.0.0.1', 5000, debug = True)
